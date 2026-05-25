/**
 * object-event-graphics-info-data.ts — Port 1:1 STRICT décomp pure.
 *
 * Sources uniques de vérité (= ne JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info.h
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info_pointers.h
 *
 * Généré automatiquement. Si le décomp change : régénérer via gen_graphics_data.py.
 *
 * Pattern : chaque graphicsInfo record du décomp devient une factory function
 * `build_gObjectEventGraphicsInfo_X(pic: Uint8Array)` qui prend les bytes raw
 * du PNG décompressé et retourne la struct complète 1:1.
 *
 * subspriteTables/anims/affineAnims = null (= ports différés vers structs séparées).
 * Au consumer du record : utiliser SetSubspriteTables, StartSpriteAnim depuis
 * les structs encore non-portées via le port engine existant.
 */

import type { ObjectEventGraphicsInfo, SpriteFrameImage } from './object-event-graphics-info';
import {
  overworld_frame,
  TAG_NONE,
  OBJ_EVENT_PAL_TAG_BRENDAN,
  OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION,
  OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_1,
  OBJ_EVENT_PAL_TAG_NPC_2,
  OBJ_EVENT_PAL_TAG_NPC_3,
  OBJ_EVENT_PAL_TAG_NPC_4,
  OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION,
  OBJ_EVENT_PAL_TAG_QUINTY_PLUMP,
  OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION,
  OBJ_EVENT_PAL_TAG_TRUCK,
  OBJ_EVENT_PAL_TAG_VIGOROTH,
  OBJ_EVENT_PAL_TAG_ZIGZAGOON,
  OBJ_EVENT_PAL_TAG_MAY,
  OBJ_EVENT_PAL_TAG_MAY_REFLECTION,
  OBJ_EVENT_PAL_TAG_MOVING_BOX,
  OBJ_EVENT_PAL_TAG_CABLE_CAR,
  OBJ_EVENT_PAL_TAG_SSTIDAL,
  OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER,
  OBJ_EVENT_PAL_TAG_KYOGRE,
  OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION,
  OBJ_EVENT_PAL_TAG_GROUDON,
  OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION,
  OBJ_EVENT_PAL_TAG_UNUSED,
  OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW,
  OBJ_EVENT_PAL_TAG_POOCHYENA,
  OBJ_EVENT_PAL_TAG_RED_LEAF,
  OBJ_EVENT_PAL_TAG_DEOXYS,
  OBJ_EVENT_PAL_TAG_BIRTH_ISLAND_STONE,
  OBJ_EVENT_PAL_TAG_HO_OH,
  OBJ_EVENT_PAL_TAG_LUGIA,
  OBJ_EVENT_PAL_TAG_RS_BRENDAN,
  OBJ_EVENT_PAL_TAG_RS_MAY,
  OBJ_EVENT_PAL_TAG_NONE,
  PALSLOT_PLAYER,
  PALSLOT_NPC_1,
  PALSLOT_NPC_2,
  PALSLOT_NPC_3,
  PALSLOT_NPC_4,
  PALSLOT_NPC_SPECIAL,
  SHADOW_SIZE_S,
  SHADOW_SIZE_M,
  SHADOW_SIZE_L,
  SHADOW_SIZE_XL,
  TRACKS_NONE,
  TRACKS_FOOT,
  TRACKS_BIKE_TIRE,
  TRACKS_SLITHER,
} from './object-event-graphics-info';
import {
  gObjectEventBaseOam_16x16,
  gObjectEventBaseOam_16x32,
  gObjectEventBaseOam_32x32,
  gObjectEventBaseOam_64x64,
  gObjectEventBaseOam_8x8,
} from './object-event-base-oam';
import {
  sAnimTable_Standard, sAnimTable_Inanimate, sAnimTable_QuintyPlump,
  sAnimTable_BrendanMayNormal, sAnimTable_AcroBike, sAnimTable_Surfing,
  sAnimTable_Nurse, sAnimTable_FieldMove, sAnimTable_BerryTree,
  sAnimTable_BreakableRock, sAnimTable_CuttableTree, sAnimTable_Fishing,
  sAnimTable_HoOh, sAnimTable_Rayquaza, sAnimTable_GroudonSide,
} from './object-event-anims-data';
import {
  sOamTables_16x16, sOamTables_16x32, sOamTables_32x32, sOamTables_48x48,
  sOamTables_64x32, sOamTables_64x64, sOamTables_96x40, sOamTables_88x32,
} from './object-event-subsprites-data';


// ─── sPicTable_* builders 1:1 décomp pic_tables.h ───────────────────────────

export function build_sPicTable_BrendanNormal(gObjectEventPic_BrendanNormal: Uint8Array, gObjectEventPic_BrendanRunning: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 0),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 1),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 2),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 3),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 4),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 5),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 6),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 7),
    overworld_frame(gObjectEventPic_BrendanNormal, 2, 4, 8),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 0),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 1),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 2),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 3),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 4),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 5),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 6),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 7),
    overworld_frame(gObjectEventPic_BrendanRunning, 2, 4, 8),
  ];
}

export function build_sPicTable_BrendanMachBike(gObjectEventPic_BrendanMachBike: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 5),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 6),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 7),
    overworld_frame(gObjectEventPic_BrendanMachBike, 4, 4, 8),
  ];
}

export function build_sPicTable_BrendanAcroBike(gObjectEventPic_BrendanAcroBike: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 5),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 6),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 7),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 8),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 9),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 10),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 11),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 12),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 13),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 14),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 15),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 16),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 17),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 18),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 19),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 20),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 21),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 22),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 23),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 24),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 25),
    overworld_frame(gObjectEventPic_BrendanAcroBike, 4, 4, 26),
  ];
}

export function build_sPicTable_BrendanSurfing(gObjectEventPic_BrendanSurfing: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanSurfing, 4, 4, 5),
  ];
}

export function build_sPicTable_BrendanUnderwater(gObjectEventPic_BrendanUnderwater: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanUnderwater, 4, 4, 2),
  ];
}

export function build_sPicTable_BrendanFieldMove(gObjectEventPic_BrendanFieldMove: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanFieldMove, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanFieldMove, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanFieldMove, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanFieldMove, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanFieldMove, 4, 4, 4),
  ];
}

export function build_sPicTable_QuintyPlump(gObjectEventPic_QuintyPlump: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 0),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 1),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 2),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 3),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 4),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 5),
    overworld_frame(gObjectEventPic_QuintyPlump, 4, 4, 6),
  ];
}

export function build_sPicTable_NinjaBoy(gObjectEventPic_NinjaBoy: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 0),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 1),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 2),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 3),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 4),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 5),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 6),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 7),
    overworld_frame(gObjectEventPic_NinjaBoy, 2, 2, 8),
  ];
}

export function build_sPicTable_Twin(gObjectEventPic_Twin: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Twin, 2, 4, 0),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 1),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 2),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 3),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 4),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 5),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 6),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 7),
    overworld_frame(gObjectEventPic_Twin, 2, 4, 8),
  ];
}

export function build_sPicTable_Boy1(gObjectEventPic_Boy1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 0),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 1),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 2),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 3),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 4),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 5),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 6),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 7),
    overworld_frame(gObjectEventPic_Boy1, 2, 4, 8),
  ];
}

export function build_sPicTable_Girl1(gObjectEventPic_Girl1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 0),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 1),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 2),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 3),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 4),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 5),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 6),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 7),
    overworld_frame(gObjectEventPic_Girl1, 2, 4, 8),
  ];
}

export function build_sPicTable_Boy2(gObjectEventPic_Boy2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 0),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 1),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 2),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 3),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 4),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 5),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 6),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 7),
    overworld_frame(gObjectEventPic_Boy2, 2, 4, 8),
  ];
}

export function build_sPicTable_Girl2(gObjectEventPic_Girl2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 0),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 1),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 2),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 3),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 4),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 5),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 6),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 7),
    overworld_frame(gObjectEventPic_Girl2, 2, 4, 8),
  ];
}

export function build_sPicTable_LittleBoy(gObjectEventPic_LittleBoy: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 0),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 1),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 2),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 3),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 4),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 5),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 6),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 7),
    overworld_frame(gObjectEventPic_LittleBoy, 2, 2, 8),
  ];
}

export function build_sPicTable_LittleGirl(gObjectEventPic_LittleGirl: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 0),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 1),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 2),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 3),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 4),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 5),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 6),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 7),
    overworld_frame(gObjectEventPic_LittleGirl, 2, 2, 8),
  ];
}

export function build_sPicTable_Boy3(gObjectEventPic_Boy3: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 0),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 1),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 2),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 3),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 4),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 5),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 6),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 7),
    overworld_frame(gObjectEventPic_Boy3, 2, 4, 8),
  ];
}

export function build_sPicTable_Girl3(gObjectEventPic_Girl3: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 0),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 1),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 2),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 3),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 4),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 5),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 6),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 7),
    overworld_frame(gObjectEventPic_Girl3, 2, 4, 8),
  ];
}

export function build_sPicTable_RichBoy(gObjectEventPic_RichBoy: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 0),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 1),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 2),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 3),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 4),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 5),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 6),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 7),
    overworld_frame(gObjectEventPic_RichBoy, 2, 4, 8),
  ];
}

export function build_sPicTable_Woman1(gObjectEventPic_Woman1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 0),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 1),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 2),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 3),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 4),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 5),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 6),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 7),
    overworld_frame(gObjectEventPic_Woman1, 2, 4, 8),
  ];
}

export function build_sPicTable_FatMan(gObjectEventPic_FatMan: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 0),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 1),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 2),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 3),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 4),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 5),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 6),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 7),
    overworld_frame(gObjectEventPic_FatMan, 2, 4, 8),
  ];
}

export function build_sPicTable_PokefanF(gObjectEventPic_PokefanF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 0),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 1),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 2),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 3),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 4),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 5),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 6),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 7),
    overworld_frame(gObjectEventPic_PokefanF, 2, 4, 8),
  ];
}

export function build_sPicTable_Man1(gObjectEventPic_Man1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Man1, 2, 4, 0),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 1),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 2),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 3),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 4),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 5),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 6),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 7),
    overworld_frame(gObjectEventPic_Man1, 2, 4, 8),
  ];
}

export function build_sPicTable_Woman2(gObjectEventPic_Woman2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 0),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 1),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 2),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 3),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 4),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 5),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 6),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 7),
    overworld_frame(gObjectEventPic_Woman2, 2, 4, 8),
  ];
}

export function build_sPicTable_ExpertM(gObjectEventPic_ExpertM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 0),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 1),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 2),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 3),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 4),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 5),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 6),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 7),
    overworld_frame(gObjectEventPic_ExpertM, 2, 4, 8),
  ];
}

export function build_sPicTable_ExpertF(gObjectEventPic_ExpertF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 0),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 1),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 2),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 3),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 4),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 5),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 6),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 7),
    overworld_frame(gObjectEventPic_ExpertF, 2, 4, 8),
  ];
}

export function build_sPicTable_Man2(gObjectEventPic_Man2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Man2, 2, 4, 0),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 1),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 2),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 3),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 4),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 5),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 6),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 7),
    overworld_frame(gObjectEventPic_Man2, 2, 4, 8),
  ];
}

export function build_sPicTable_Woman3(gObjectEventPic_Woman3: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 0),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 1),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 2),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 3),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 4),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 5),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 6),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 7),
    overworld_frame(gObjectEventPic_Woman3, 2, 4, 8),
  ];
}

export function build_sPicTable_PokefanM(gObjectEventPic_PokefanM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 0),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 1),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 2),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 3),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 4),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 5),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 6),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 7),
    overworld_frame(gObjectEventPic_PokefanM, 2, 4, 8),
  ];
}

export function build_sPicTable_Woman4(gObjectEventPic_Woman4: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 0),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 1),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 2),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 3),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 4),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 5),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 6),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 7),
    overworld_frame(gObjectEventPic_Woman4, 2, 4, 8),
  ];
}

export function build_sPicTable_Cook(gObjectEventPic_Cook: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Cook, 2, 4, 0),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 1),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 2),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 0),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 0),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 1),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 1),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 2),
    overworld_frame(gObjectEventPic_Cook, 2, 4, 2),
  ];
}

export function build_sPicTable_LinkReceptionist(gObjectEventPic_LinkReceptionist: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 0),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 1),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 2),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 3),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 4),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 5),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 6),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 7),
    overworld_frame(gObjectEventPic_LinkReceptionist, 2, 4, 8),
  ];
}

export function build_sPicTable_OldMan(gObjectEventPic_OldMan: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 0),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 1),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 2),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 0),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 0),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 1),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 1),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 2),
    overworld_frame(gObjectEventPic_OldMan, 2, 4, 2),
  ];
}

export function build_sPicTable_OldWoman(gObjectEventPic_OldWoman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 0),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 1),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 2),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 3),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 4),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 5),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 6),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 7),
    overworld_frame(gObjectEventPic_OldWoman, 2, 4, 8),
  ];
}

export function build_sPicTable_Camper(gObjectEventPic_Camper: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Camper, 2, 4, 0),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 1),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 2),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 3),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 4),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 5),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 6),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 7),
    overworld_frame(gObjectEventPic_Camper, 2, 4, 8),
  ];
}

export function build_sPicTable_Picnicker(gObjectEventPic_Picnicker: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 0),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 1),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 2),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 3),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 4),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 5),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 6),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 7),
    overworld_frame(gObjectEventPic_Picnicker, 2, 4, 8),
  ];
}

export function build_sPicTable_Man3(gObjectEventPic_Man3: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Man3, 2, 4, 0),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 1),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 2),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 3),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 4),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 5),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 6),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 7),
    overworld_frame(gObjectEventPic_Man3, 2, 4, 8),
  ];
}

export function build_sPicTable_Woman5(gObjectEventPic_Woman5: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 0),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 1),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 2),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 3),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 4),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 5),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 6),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 7),
    overworld_frame(gObjectEventPic_Woman5, 2, 4, 8),
  ];
}

export function build_sPicTable_Youngster(gObjectEventPic_Youngster: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 0),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 1),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 2),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 3),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 4),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 5),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 6),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 7),
    overworld_frame(gObjectEventPic_Youngster, 2, 4, 8),
  ];
}

export function build_sPicTable_BugCatcher(gObjectEventPic_BugCatcher: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 0),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 1),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 2),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 3),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 4),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 5),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 6),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 7),
    overworld_frame(gObjectEventPic_BugCatcher, 2, 4, 8),
  ];
}

export function build_sPicTable_PsychicM(gObjectEventPic_PsychicM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 0),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 1),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 2),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 3),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 4),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 5),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 6),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 7),
    overworld_frame(gObjectEventPic_PsychicM, 2, 4, 8),
  ];
}

export function build_sPicTable_SchoolKidM(gObjectEventPic_SchoolKidM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 0),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 1),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 2),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 3),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 4),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 5),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 6),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 7),
    overworld_frame(gObjectEventPic_SchoolKidM, 2, 4, 8),
  ];
}

export function build_sPicTable_Maniac(gObjectEventPic_Maniac: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 0),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 1),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 2),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 3),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 4),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 5),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 6),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 7),
    overworld_frame(gObjectEventPic_Maniac, 2, 4, 8),
  ];
}

export function build_sPicTable_HexManiac(gObjectEventPic_HexManiac: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 0),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 1),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 2),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 3),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 4),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 5),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 6),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 7),
    overworld_frame(gObjectEventPic_HexManiac, 2, 4, 8),
  ];
}

export function build_sPicTable_SwimmerM(gObjectEventPic_SwimmerM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 0),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 1),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 2),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 3),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 4),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 5),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 6),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 7),
    overworld_frame(gObjectEventPic_SwimmerM, 2, 4, 8),
  ];
}

export function build_sPicTable_SwimmerF(gObjectEventPic_SwimmerF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 0),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 1),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 2),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 3),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 4),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 5),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 6),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 7),
    overworld_frame(gObjectEventPic_SwimmerF, 2, 4, 8),
  ];
}

export function build_sPicTable_BlackBelt(gObjectEventPic_BlackBelt: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 0),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 1),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 2),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 3),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 4),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 5),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 6),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 7),
    overworld_frame(gObjectEventPic_BlackBelt, 2, 4, 8),
  ];
}

export function build_sPicTable_Beauty(gObjectEventPic_Beauty: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 0),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 1),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 2),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 3),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 4),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 5),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 6),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 7),
    overworld_frame(gObjectEventPic_Beauty, 2, 4, 8),
  ];
}

export function build_sPicTable_Scientist1(gObjectEventPic_Scientist1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 0),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 1),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 2),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 3),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 4),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 5),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 6),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 7),
    overworld_frame(gObjectEventPic_Scientist1, 2, 4, 8),
  ];
}

export function build_sPicTable_Lass(gObjectEventPic_Lass: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Lass, 2, 4, 0),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 1),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 2),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 3),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 4),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 5),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 6),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 7),
    overworld_frame(gObjectEventPic_Lass, 2, 4, 8),
  ];
}

export function build_sPicTable_Gentleman(gObjectEventPic_Gentleman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 0),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 1),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 2),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 3),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 4),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 5),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 6),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 7),
    overworld_frame(gObjectEventPic_Gentleman, 2, 4, 8),
  ];
}

export function build_sPicTable_Sailor(gObjectEventPic_Sailor: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 2),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 3),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 4),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 5),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 6),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 7),
    overworld_frame(gObjectEventPic_Sailor, 2, 4, 8),
  ];
}

export function build_sPicTable_Fisherman(gObjectEventPic_Fisherman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 0),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 1),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 2),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 3),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 4),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 5),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 6),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 7),
    overworld_frame(gObjectEventPic_Fisherman, 2, 4, 8),
  ];
}

export function build_sPicTable_RunningTriathleteM(gObjectEventPic_RunningTriathleteM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 0),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 1),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 2),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 3),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 4),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 5),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 6),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 7),
    overworld_frame(gObjectEventPic_RunningTriathleteM, 2, 4, 8),
  ];
}

export function build_sPicTable_RunningTriathleteF(gObjectEventPic_RunningTriathleteF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 0),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 1),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 2),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 3),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 4),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 5),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 6),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 7),
    overworld_frame(gObjectEventPic_RunningTriathleteF, 2, 4, 8),
  ];
}

export function build_sPicTable_TuberF(gObjectEventPic_TuberF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 0),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 1),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 2),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 3),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 4),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 5),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 6),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 7),
    overworld_frame(gObjectEventPic_TuberF, 2, 2, 8),
  ];
}

export function build_sPicTable_TuberM(gObjectEventPic_TuberM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 0),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 1),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 2),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 3),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 4),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 5),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 6),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 7),
    overworld_frame(gObjectEventPic_TuberM, 2, 2, 8),
  ];
}

export function build_sPicTable_Hiker(gObjectEventPic_Hiker: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 0),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 1),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 2),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 3),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 4),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 5),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 6),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 7),
    overworld_frame(gObjectEventPic_Hiker, 2, 4, 8),
  ];
}

export function build_sPicTable_CyclingTriathleteM(gObjectEventPic_CyclingTriathleteM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 0),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 1),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 2),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 3),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 4),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 5),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 6),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 7),
    overworld_frame(gObjectEventPic_CyclingTriathleteM, 4, 4, 8),
  ];
}

export function build_sPicTable_CyclingTriathleteF(gObjectEventPic_CyclingTriathleteF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 0),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 1),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 2),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 3),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 4),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 5),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 6),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 7),
    overworld_frame(gObjectEventPic_CyclingTriathleteF, 4, 4, 8),
  ];
}

export function build_sPicTable_Nurse(gObjectEventPic_Nurse: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 0),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 1),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 2),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 0),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 0),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 1),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 1),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 2),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 2),
    overworld_frame(gObjectEventPic_Nurse, 2, 4, 3),
  ];
}

export function build_sPicTable_ItemBall(gObjectEventPic_ItemBall: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp object_event_pic_tables.h:746-748 :
  //   obj_frame_tiles(gObjectEventPic_ItemBall)
  // = { .data = ptr, .size = sizeof(ptr) }. Single 16x16 frame.
  return [
    { data: gObjectEventPic_ItemBall, size: gObjectEventPic_ItemBall.length },
  ];
}

export function build_sPicTable_ProfBirch(gObjectEventPic_ProfBirch: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 0),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 1),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 2),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 3),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 4),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 5),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 6),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 7),
    overworld_frame(gObjectEventPic_ProfBirch, 2, 4, 8),
  ];
}

export function build_sPicTable_Man4(gObjectEventPic_Man4: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Man4, 2, 4, 0),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 1),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 2),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 3),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 4),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 5),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 6),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 7),
    overworld_frame(gObjectEventPic_Man4, 2, 4, 8),
  ];
}

export function build_sPicTable_Man5(gObjectEventPic_Man5: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Man5, 2, 4, 0),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 1),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 2),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 3),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 4),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 5),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 6),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 7),
    overworld_frame(gObjectEventPic_Man5, 2, 4, 8),
  ];
}

export function build_sPicTable_ReporterM(gObjectEventPic_ReporterM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 0),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 1),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 2),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 3),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 4),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 5),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 6),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 7),
    overworld_frame(gObjectEventPic_ReporterM, 2, 4, 8),
  ];
}

export function build_sPicTable_ReporterF(gObjectEventPic_ReporterF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 0),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 1),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 2),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 3),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 4),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 5),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 6),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 7),
    overworld_frame(gObjectEventPic_ReporterF, 2, 4, 8),
  ];
}

export function build_sPicTable_MauvilleOldMan1(gObjectEventPic_MauvilleOldMan1: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 0),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 1),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 2),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 3),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 4),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 5),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 6),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 7),
    overworld_frame(gObjectEventPic_MauvilleOldMan1, 2, 4, 8),
  ];
}

export function build_sPicTable_MauvilleOldMan2(gObjectEventPic_MauvilleOldMan2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 0),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 1),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 2),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 3),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 4),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 5),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 6),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 7),
    overworld_frame(gObjectEventPic_MauvilleOldMan2, 2, 4, 8),
  ];
}

export function build_sPicTable_UnusedNatuDoll(gObjectEventPic_UnusedNatuDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedNatuDoll).
  return [
    { data: gObjectEventPic_UnusedNatuDoll, size: gObjectEventPic_UnusedNatuDoll.length },
  ];
}

export function build_sPicTable_UnusedMagnemiteDoll(gObjectEventPic_UnusedMagnemiteDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedMagnemiteDoll).
  return [
    { data: gObjectEventPic_UnusedMagnemiteDoll, size: gObjectEventPic_UnusedMagnemiteDoll.length },
  ];
}

export function build_sPicTable_UnusedSquirtleDoll(gObjectEventPic_UnusedSquirtleDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedSquirtleDoll).
  return [
    { data: gObjectEventPic_UnusedSquirtleDoll, size: gObjectEventPic_UnusedSquirtleDoll.length },
  ];
}

export function build_sPicTable_UnusedWooperDoll(gObjectEventPic_UnusedWooperDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedWooperDoll).
  return [
    { data: gObjectEventPic_UnusedWooperDoll, size: gObjectEventPic_UnusedWooperDoll.length },
  ];
}

export function build_sPicTable_UnusedPikachuDoll(gObjectEventPic_UnusedPikachuDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedPikachuDoll).
  return [
    { data: gObjectEventPic_UnusedPikachuDoll, size: gObjectEventPic_UnusedPikachuDoll.length },
  ];
}

export function build_sPicTable_UnusedPorygon2Doll(gObjectEventPic_UnusedPorygon2Doll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_UnusedPorygon2Doll).
  return [
    { data: gObjectEventPic_UnusedPorygon2Doll, size: gObjectEventPic_UnusedPorygon2Doll.length },
  ];
}

export function build_sPicTable_CuttableTree(gObjectEventPic_CuttableTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_CuttableTree, 2, 2, 0),
    overworld_frame(gObjectEventPic_CuttableTree, 2, 2, 1),
    overworld_frame(gObjectEventPic_CuttableTree, 2, 2, 2),
    overworld_frame(gObjectEventPic_CuttableTree, 2, 2, 3),
  ];
}

export function build_sPicTable_MartEmployee(gObjectEventPic_MartEmployee: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 0),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 1),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 2),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 3),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 4),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 5),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 6),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 7),
    overworld_frame(gObjectEventPic_MartEmployee, 2, 4, 8),
  ];
}

export function build_sPicTable_RooftopSaleWoman(gObjectEventPic_RooftopSaleWoman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 0),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 1),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 2),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 3),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 4),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 5),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 6),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 7),
    overworld_frame(gObjectEventPic_RooftopSaleWoman, 2, 4, 8),
  ];
}

export function build_sPicTable_Teala(gObjectEventPic_Teala: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Teala, 2, 4, 0),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 1),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 2),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 3),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 4),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 5),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 6),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 7),
    overworld_frame(gObjectEventPic_Teala, 2, 4, 8),
  ];
}

export function build_sPicTable_BreakableRock(gObjectEventPic_BreakableRock: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BreakableRock, 2, 2, 0),
    overworld_frame(gObjectEventPic_BreakableRock, 2, 2, 1),
    overworld_frame(gObjectEventPic_BreakableRock, 2, 2, 2),
    overworld_frame(gObjectEventPic_BreakableRock, 2, 2, 3),
  ];
}

export function build_sPicTable_PushableBoulder(gObjectEventPic_PushableBoulder: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_PushableBoulder).
  return [
    { data: gObjectEventPic_PushableBoulder, size: gObjectEventPic_PushableBoulder.length },
  ];
}

export function build_sPicTable_MrBrineysBoat(gObjectEventPic_MrBrineysBoat: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 0),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 1),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 2),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 0),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 0),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 1),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 1),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 2),
    overworld_frame(gObjectEventPic_MrBrineysBoat, 4, 4, 2),
  ];
}

export function build_sPicTable_Truck(gObjectEventPic_Truck: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_Truck).
  return [
    { data: gObjectEventPic_Truck, size: gObjectEventPic_Truck.length },
  ];
}

export function build_sPicTable_VigorothCarryingBox(gObjectEventPic_Vigoroth: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 0),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 0),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 0),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 1),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 2),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 1),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 2),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 1),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 2),
  ];
}

export function build_sPicTable_VigorothFacingAway(gObjectEventPic_Vigoroth: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 3),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 3),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 3),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
    overworld_frame(gObjectEventPic_Vigoroth, 4, 4, 4),
  ];
}

export function build_sPicTable_BirchsBag(gObjectEventPic_BirchsBag: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BirchsBag).
  return [
    { data: gObjectEventPic_BirchsBag, size: gObjectEventPic_BirchsBag.length },
  ];
}

export function build_sPicTable_EnemyZigzagoon(gObjectEventPic_EnemyZigzagoon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 0),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 1),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 2),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 3),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 4),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 5),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 6),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 7),
    overworld_frame(gObjectEventPic_EnemyZigzagoon, 4, 4, 8),
  ];
}

export function build_sPicTable_Poochyena(gObjectEventPic_Poochyena: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 0),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 1),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 2),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 3),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 4),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 5),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 6),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 7),
    overworld_frame(gObjectEventPic_Poochyena, 4, 4, 8),
  ];
}

export function build_sPicTable_Artist(gObjectEventPic_Artist: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Artist, 2, 4, 0),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 1),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 2),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 3),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 4),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 5),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 6),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 7),
    overworld_frame(gObjectEventPic_Artist, 2, 4, 8),
  ];
}

export function build_sPicTable_MayNormal(gObjectEventPic_MayNormal: Uint8Array, gObjectEventPic_MayRunning: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 0),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 1),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 2),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 3),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 4),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 5),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 6),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 7),
    overworld_frame(gObjectEventPic_MayNormal, 2, 4, 8),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 0),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 1),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 2),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 3),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 4),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 5),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 6),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 7),
    overworld_frame(gObjectEventPic_MayRunning, 2, 4, 8),
  ];
}

export function build_sPicTable_MayMachBike(gObjectEventPic_MayMachBike: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 4),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 5),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 6),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 7),
    overworld_frame(gObjectEventPic_MayMachBike, 4, 4, 8),
  ];
}

export function build_sPicTable_MayAcroBike(gObjectEventPic_MayAcroBike: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 4),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 5),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 6),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 7),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 8),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 9),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 10),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 11),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 12),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 13),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 14),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 15),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 16),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 17),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 18),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 19),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 20),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 21),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 22),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 23),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 24),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 25),
    overworld_frame(gObjectEventPic_MayAcroBike, 4, 4, 26),
  ];
}

export function build_sPicTable_MaySurfing(gObjectEventPic_MaySurfing: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 0),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 2),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 4),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 1),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 3),
    overworld_frame(gObjectEventPic_MaySurfing, 4, 4, 5),
  ];
}

export function build_sPicTable_MayUnderwater(gObjectEventPic_MayUnderwater: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayUnderwater, 4, 4, 2),
  ];
}

export function build_sPicTable_MayFieldMove(gObjectEventPic_MayFieldMove: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayFieldMove, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayFieldMove, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayFieldMove, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayFieldMove, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayFieldMove, 4, 4, 4),
  ];
}

export function build_sPicTable_Cameraman(gObjectEventPic_Cameraman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 0),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 1),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 2),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 3),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 4),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 5),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 6),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 7),
    overworld_frame(gObjectEventPic_Cameraman, 2, 4, 8),
  ];
}

export function build_sPicTable_MovingBox(gObjectEventPic_MovingBox: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_MovingBox).
  return [
    { data: gObjectEventPic_MovingBox, size: gObjectEventPic_MovingBox.length },
  ];
}

export function build_sPicTable_CableCar(gObjectEventPic_CableCar: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_CableCar).
  return [
    { data: gObjectEventPic_CableCar, size: gObjectEventPic_CableCar.length },
  ];
}

export function build_sPicTable_Scientist2(gObjectEventPic_Scientist2: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 0),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 1),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 2),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 3),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 4),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 5),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 6),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 7),
    overworld_frame(gObjectEventPic_Scientist2, 2, 4, 8),
  ];
}

export function build_sPicTable_DevonEmployee(gObjectEventPic_DevonEmployee: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 0),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 1),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 2),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 3),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 4),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 5),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 6),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 7),
    overworld_frame(gObjectEventPic_DevonEmployee, 2, 4, 8),
  ];
}

export function build_sPicTable_AquaMemberM(gObjectEventPic_AquaMemberM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 0),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 1),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 2),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 3),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 4),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 5),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 6),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 7),
    overworld_frame(gObjectEventPic_AquaMemberM, 2, 4, 8),
  ];
}

export function build_sPicTable_AquaMemberF(gObjectEventPic_AquaMemberF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 0),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 1),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 2),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 3),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 4),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 5),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 6),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 7),
    overworld_frame(gObjectEventPic_AquaMemberF, 2, 4, 8),
  ];
}

export function build_sPicTable_MagmaMemberM(gObjectEventPic_MagmaMemberM: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 0),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 1),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 2),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 3),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 4),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 5),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 6),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 7),
    overworld_frame(gObjectEventPic_MagmaMemberM, 2, 4, 8),
  ];
}

export function build_sPicTable_MagmaMemberF(gObjectEventPic_MagmaMemberF: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 0),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 1),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 2),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 3),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 4),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 5),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 6),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 7),
    overworld_frame(gObjectEventPic_MagmaMemberF, 2, 4, 8),
  ];
}

export function build_sPicTable_Sidney(gObjectEventPic_Sidney: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 2),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 2),
    overworld_frame(gObjectEventPic_Sidney, 2, 4, 2),
  ];
}

export function build_sPicTable_Phoebe(gObjectEventPic_Phoebe: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 0),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 1),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 2),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 0),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 0),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 1),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 1),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 2),
    overworld_frame(gObjectEventPic_Phoebe, 2, 4, 2),
  ];
}

export function build_sPicTable_Glacia(gObjectEventPic_Glacia: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 0),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 1),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 2),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 0),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 0),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 1),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 1),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 2),
    overworld_frame(gObjectEventPic_Glacia, 2, 4, 2),
  ];
}

export function build_sPicTable_Drake(gObjectEventPic_Drake: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Drake, 2, 4, 0),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 1),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 2),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 0),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 0),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 1),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 1),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 2),
    overworld_frame(gObjectEventPic_Drake, 2, 4, 2),
  ];
}

export function build_sPicTable_Roxanne(gObjectEventPic_Roxanne: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 0),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 1),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 2),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 0),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 0),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 1),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 1),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 2),
    overworld_frame(gObjectEventPic_Roxanne, 2, 4, 2),
  ];
}

export function build_sPicTable_Brawly(gObjectEventPic_Brawly: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 0),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 1),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 2),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 0),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 0),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 1),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 1),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 2),
    overworld_frame(gObjectEventPic_Brawly, 2, 4, 2),
  ];
}

export function build_sPicTable_Wattson(gObjectEventPic_Wattson: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 0),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 1),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 2),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 0),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 0),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 1),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 1),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 2),
    overworld_frame(gObjectEventPic_Wattson, 2, 4, 2),
  ];
}

export function build_sPicTable_Flannery(gObjectEventPic_Flannery: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 0),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 1),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 2),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 0),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 0),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 1),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 1),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 2),
    overworld_frame(gObjectEventPic_Flannery, 2, 4, 2),
  ];
}

export function build_sPicTable_Norman(gObjectEventPic_Norman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Norman, 2, 4, 0),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 1),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 2),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 3),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 4),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 5),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 6),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 7),
    overworld_frame(gObjectEventPic_Norman, 2, 4, 8),
  ];
}

export function build_sPicTable_Winona(gObjectEventPic_Winona: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Winona, 2, 4, 0),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 1),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 2),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 0),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 0),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 1),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 1),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 2),
    overworld_frame(gObjectEventPic_Winona, 2, 4, 2),
  ];
}

export function build_sPicTable_Liza(gObjectEventPic_Liza: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Liza, 2, 4, 0),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 1),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 2),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 0),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 0),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 1),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 1),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 2),
    overworld_frame(gObjectEventPic_Liza, 2, 4, 2),
  ];
}

export function build_sPicTable_Tate(gObjectEventPic_Tate: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Tate, 2, 4, 0),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 1),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 2),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 0),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 0),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 1),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 1),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 2),
    overworld_frame(gObjectEventPic_Tate, 2, 4, 2),
  ];
}

export function build_sPicTable_Wallace(gObjectEventPic_Wallace: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 0),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 1),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 2),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 3),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 4),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 5),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 6),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 7),
    overworld_frame(gObjectEventPic_Wallace, 2, 4, 8),
  ];
}

export function build_sPicTable_Steven(gObjectEventPic_Steven: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Steven, 2, 4, 0),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 1),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 2),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 3),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 4),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 5),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 6),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 7),
    overworld_frame(gObjectEventPic_Steven, 2, 4, 8),
  ];
}

export function build_sPicTable_Wally(gObjectEventPic_Wally: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Wally, 2, 4, 0),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 1),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 2),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 3),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 4),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 5),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 6),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 7),
    overworld_frame(gObjectEventPic_Wally, 2, 4, 8),
  ];
}

export function build_sPicTable_RubySapphireLittleBoy(gObjectEventPic_RubySapphireLittleBoy: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 0),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 1),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 2),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 3),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 4),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 5),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 6),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 7),
    overworld_frame(gObjectEventPic_RubySapphireLittleBoy, 2, 2, 8),
  ];
}

export function build_sPicTable_BrendanFishing(gObjectEventPic_BrendanFishing: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 5),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 6),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 7),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 8),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 9),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 10),
    overworld_frame(gObjectEventPic_BrendanFishing, 4, 4, 11),
  ];
}

export function build_sPicTable_MayFishing(gObjectEventPic_MayFishing: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 4),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 5),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 6),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 7),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 8),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 9),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 10),
    overworld_frame(gObjectEventPic_MayFishing, 4, 4, 11),
  ];
}

export function build_sPicTable_HotSpringsOldWoman(gObjectEventPic_HotSpringsOldWoman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 0),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 1),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 2),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 3),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 4),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 5),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 6),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 7),
    overworld_frame(gObjectEventPic_HotSpringsOldWoman, 2, 4, 8),
  ];
}

export function build_sPicTable_SSTidal(gObjectEventPic_SSTidal: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp : 9× obj_frame_tiles(gObjectEventPic_SSTidal) (= 9 frames identical
  // car SS Tidal n'a pas d'anim). Sprite static utilisé pour toutes les anim slots.
  const entry = { data: gObjectEventPic_SSTidal, size: gObjectEventPic_SSTidal.length };
  return [entry, entry, entry, entry, entry, entry, entry, entry, entry];
}

export function build_sPicTable_SubmarineShadow(gObjectEventPic_SubmarineShadow: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp : 9× obj_frame_tiles(gObjectEventPic_SubmarineShadow).
  const entry = { data: gObjectEventPic_SubmarineShadow, size: gObjectEventPic_SubmarineShadow.length };
  return [entry, entry, entry, entry, entry, entry, entry, entry, entry];
}

export function build_sPicTable_PichuDoll(gObjectEventPic_PichuDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_PichuDoll).
  return [
    { data: gObjectEventPic_PichuDoll, size: gObjectEventPic_PichuDoll.length },
  ];
}

export function build_sPicTable_PikachuDoll(gObjectEventPic_PikachuDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_PikachuDoll).
  return [
    { data: gObjectEventPic_PikachuDoll, size: gObjectEventPic_PikachuDoll.length },
  ];
}

export function build_sPicTable_MarillDoll(gObjectEventPic_MarillDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_MarillDoll).
  return [
    { data: gObjectEventPic_MarillDoll, size: gObjectEventPic_MarillDoll.length },
  ];
}

export function build_sPicTable_TogepiDoll(gObjectEventPic_TogepiDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_TogepiDoll).
  return [
    { data: gObjectEventPic_TogepiDoll, size: gObjectEventPic_TogepiDoll.length },
  ];
}

export function build_sPicTable_CyndaquilDoll(gObjectEventPic_CyndaquilDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_CyndaquilDoll).
  return [
    { data: gObjectEventPic_CyndaquilDoll, size: gObjectEventPic_CyndaquilDoll.length },
  ];
}

export function build_sPicTable_ChikoritaDoll(gObjectEventPic_ChikoritaDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_ChikoritaDoll).
  return [
    { data: gObjectEventPic_ChikoritaDoll, size: gObjectEventPic_ChikoritaDoll.length },
  ];
}

export function build_sPicTable_TotodileDoll(gObjectEventPic_TotodileDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_TotodileDoll).
  return [
    { data: gObjectEventPic_TotodileDoll, size: gObjectEventPic_TotodileDoll.length },
  ];
}

export function build_sPicTable_JigglypuffDoll(gObjectEventPic_JigglypuffDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_JigglypuffDoll).
  return [
    { data: gObjectEventPic_JigglypuffDoll, size: gObjectEventPic_JigglypuffDoll.length },
  ];
}

export function build_sPicTable_MeowthDoll(gObjectEventPic_MeowthDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_MeowthDoll).
  return [
    { data: gObjectEventPic_MeowthDoll, size: gObjectEventPic_MeowthDoll.length },
  ];
}

export function build_sPicTable_ClefairyDoll(gObjectEventPic_ClefairyDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_ClefairyDoll).
  return [
    { data: gObjectEventPic_ClefairyDoll, size: gObjectEventPic_ClefairyDoll.length },
  ];
}

export function build_sPicTable_DittoDoll(gObjectEventPic_DittoDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_DittoDoll).
  return [
    { data: gObjectEventPic_DittoDoll, size: gObjectEventPic_DittoDoll.length },
  ];
}

export function build_sPicTable_SmoochumDoll(gObjectEventPic_SmoochumDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_SmoochumDoll).
  return [
    { data: gObjectEventPic_SmoochumDoll, size: gObjectEventPic_SmoochumDoll.length },
  ];
}

export function build_sPicTable_TreeckoDoll(gObjectEventPic_TreeckoDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_TreeckoDoll).
  return [
    { data: gObjectEventPic_TreeckoDoll, size: gObjectEventPic_TreeckoDoll.length },
  ];
}

export function build_sPicTable_TorchicDoll(gObjectEventPic_TorchicDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_TorchicDoll).
  return [
    { data: gObjectEventPic_TorchicDoll, size: gObjectEventPic_TorchicDoll.length },
  ];
}

export function build_sPicTable_MudkipDoll(gObjectEventPic_MudkipDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_MudkipDoll).
  return [
    { data: gObjectEventPic_MudkipDoll, size: gObjectEventPic_MudkipDoll.length },
  ];
}

export function build_sPicTable_DuskullDoll(gObjectEventPic_DuskullDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_DuskullDoll).
  return [
    { data: gObjectEventPic_DuskullDoll, size: gObjectEventPic_DuskullDoll.length },
  ];
}

export function build_sPicTable_WynautDoll(gObjectEventPic_WynautDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_WynautDoll).
  return [
    { data: gObjectEventPic_WynautDoll, size: gObjectEventPic_WynautDoll.length },
  ];
}

export function build_sPicTable_BaltoyDoll(gObjectEventPic_BaltoyDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BaltoyDoll).
  return [
    { data: gObjectEventPic_BaltoyDoll, size: gObjectEventPic_BaltoyDoll.length },
  ];
}

export function build_sPicTable_KecleonDoll(gObjectEventPic_KecleonDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_KecleonDoll).
  return [
    { data: gObjectEventPic_KecleonDoll, size: gObjectEventPic_KecleonDoll.length },
  ];
}

export function build_sPicTable_AzurillDoll(gObjectEventPic_AzurillDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_AzurillDoll).
  return [
    { data: gObjectEventPic_AzurillDoll, size: gObjectEventPic_AzurillDoll.length },
  ];
}

export function build_sPicTable_SkittyDoll(gObjectEventPic_SkittyDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_SkittyDoll).
  return [
    { data: gObjectEventPic_SkittyDoll, size: gObjectEventPic_SkittyDoll.length },
  ];
}

export function build_sPicTable_SwabluDoll(gObjectEventPic_SwabluDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_SwabluDoll).
  return [
    { data: gObjectEventPic_SwabluDoll, size: gObjectEventPic_SwabluDoll.length },
  ];
}

export function build_sPicTable_GulpinDoll(gObjectEventPic_GulpinDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_GulpinDoll).
  return [
    { data: gObjectEventPic_GulpinDoll, size: gObjectEventPic_GulpinDoll.length },
  ];
}

export function build_sPicTable_LotadDoll(gObjectEventPic_LotadDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_LotadDoll).
  return [
    { data: gObjectEventPic_LotadDoll, size: gObjectEventPic_LotadDoll.length },
  ];
}

export function build_sPicTable_SeedotDoll(gObjectEventPic_SeedotDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_SeedotDoll).
  return [
    { data: gObjectEventPic_SeedotDoll, size: gObjectEventPic_SeedotDoll.length },
  ];
}

export function build_sPicTable_PikaCushion(gObjectEventPic_PikaCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_PikaCushion).
  return [
    { data: gObjectEventPic_PikaCushion, size: gObjectEventPic_PikaCushion.length },
  ];
}

export function build_sPicTable_RoundCushion(gObjectEventPic_RoundCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_RoundCushion).
  return [
    { data: gObjectEventPic_RoundCushion, size: gObjectEventPic_RoundCushion.length },
  ];
}

export function build_sPicTable_KissCushion(gObjectEventPic_KissCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_KissCushion).
  return [
    { data: gObjectEventPic_KissCushion, size: gObjectEventPic_KissCushion.length },
  ];
}

export function build_sPicTable_ZigzagCushion(gObjectEventPic_ZigzagCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_ZigzagCushion).
  return [
    { data: gObjectEventPic_ZigzagCushion, size: gObjectEventPic_ZigzagCushion.length },
  ];
}

export function build_sPicTable_SpinCushion(gObjectEventPic_SpinCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_SpinCushion).
  return [
    { data: gObjectEventPic_SpinCushion, size: gObjectEventPic_SpinCushion.length },
  ];
}

export function build_sPicTable_DiamondCushion(gObjectEventPic_DiamondCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_DiamondCushion).
  return [
    { data: gObjectEventPic_DiamondCushion, size: gObjectEventPic_DiamondCushion.length },
  ];
}

export function build_sPicTable_BallCushion(gObjectEventPic_BallCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BallCushion).
  return [
    { data: gObjectEventPic_BallCushion, size: gObjectEventPic_BallCushion.length },
  ];
}

export function build_sPicTable_GrassCushion(gObjectEventPic_GrassCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_GrassCushion).
  return [
    { data: gObjectEventPic_GrassCushion, size: gObjectEventPic_GrassCushion.length },
  ];
}

export function build_sPicTable_FireCushion(gObjectEventPic_FireCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_FireCushion).
  return [
    { data: gObjectEventPic_FireCushion, size: gObjectEventPic_FireCushion.length },
  ];
}

export function build_sPicTable_WaterCushion(gObjectEventPic_WaterCushion: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_WaterCushion).
  return [
    { data: gObjectEventPic_WaterCushion, size: gObjectEventPic_WaterCushion.length },
  ];
}

export function build_sPicTable_BigSnorlaxDoll(gObjectEventPic_BigSnorlaxDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigSnorlaxDoll).
  return [
    { data: gObjectEventPic_BigSnorlaxDoll, size: gObjectEventPic_BigSnorlaxDoll.length },
  ];
}

export function build_sPicTable_BigRhydonDoll(gObjectEventPic_BigRhydonDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigRhydonDoll).
  return [
    { data: gObjectEventPic_BigRhydonDoll, size: gObjectEventPic_BigRhydonDoll.length },
  ];
}

export function build_sPicTable_BigLaprasDoll(gObjectEventPic_BigLaprasDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigLaprasDoll).
  return [
    { data: gObjectEventPic_BigLaprasDoll, size: gObjectEventPic_BigLaprasDoll.length },
  ];
}

export function build_sPicTable_BigVenusaurDoll(gObjectEventPic_BigVenusaurDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigVenusaurDoll).
  return [
    { data: gObjectEventPic_BigVenusaurDoll, size: gObjectEventPic_BigVenusaurDoll.length },
  ];
}

export function build_sPicTable_BigCharizardDoll(gObjectEventPic_BigCharizardDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigCharizardDoll).
  return [
    { data: gObjectEventPic_BigCharizardDoll, size: gObjectEventPic_BigCharizardDoll.length },
  ];
}

export function build_sPicTable_BigBlastoiseDoll(gObjectEventPic_BigBlastoiseDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigBlastoiseDoll).
  return [
    { data: gObjectEventPic_BigBlastoiseDoll, size: gObjectEventPic_BigBlastoiseDoll.length },
  ];
}

export function build_sPicTable_BigWailmerDoll(gObjectEventPic_BigWailmerDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigWailmerDoll).
  return [
    { data: gObjectEventPic_BigWailmerDoll, size: gObjectEventPic_BigWailmerDoll.length },
  ];
}

export function build_sPicTable_BigRegirockDoll(gObjectEventPic_BigRegirockDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigRegirockDoll).
  return [
    { data: gObjectEventPic_BigRegirockDoll, size: gObjectEventPic_BigRegirockDoll.length },
  ];
}

export function build_sPicTable_BigRegiceDoll(gObjectEventPic_BigRegiceDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigRegiceDoll).
  return [
    { data: gObjectEventPic_BigRegiceDoll, size: gObjectEventPic_BigRegiceDoll.length },
  ];
}

export function build_sPicTable_BigRegisteelDoll(gObjectEventPic_BigRegisteelDoll: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BigRegisteelDoll).
  return [
    { data: gObjectEventPic_BigRegisteelDoll, size: gObjectEventPic_BigRegisteelDoll.length },
  ];
}

export function build_sPicTable_LatiasLatios(gObjectEventPic_LatiasLatios: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 0),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 0),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 0),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 1),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 2),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 1),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 2),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 1),
    overworld_frame(gObjectEventPic_LatiasLatios, 4, 4, 2),
  ];
}

export function build_sPicTable_GameboyKid(gObjectEventPic_GameboyKid: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 0),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 1),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 2),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 0),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 0),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 1),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 1),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 2),
    overworld_frame(gObjectEventPic_GameboyKid, 2, 4, 2),
  ];
}

export function build_sPicTable_ContestJudge(gObjectEventPic_ContestJudge: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 0),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 1),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 2),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 3),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 4),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 5),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 6),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 7),
    overworld_frame(gObjectEventPic_ContestJudge, 2, 4, 8),
  ];
}

export function build_sPicTable_BrendanWatering(gObjectEventPic_BrendanWatering: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 0),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 2),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 4),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 1),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 3),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 5),
    overworld_frame(gObjectEventPic_BrendanWatering, 4, 4, 5),
  ];
}

export function build_sPicTable_MayWatering(gObjectEventPic_MayWatering: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 0),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 2),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 4),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 1),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 3),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 5),
    overworld_frame(gObjectEventPic_MayWatering, 4, 4, 5),
  ];
}

export function build_sPicTable_BrendanDecorating(gObjectEventPic_BrendanDecorating: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BrendanDecorating).
  return [
    { data: gObjectEventPic_BrendanDecorating, size: gObjectEventPic_BrendanDecorating.length },
  ];
}

export function build_sPicTable_MayDecorating(gObjectEventPic_MayDecorating: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_MayDecorating).
  return [
    { data: gObjectEventPic_MayDecorating, size: gObjectEventPic_MayDecorating.length },
  ];
}

export function build_sPicTable_Archie(gObjectEventPic_Archie: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Archie, 2, 4, 0),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 1),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 2),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 3),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 4),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 5),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 6),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 7),
    overworld_frame(gObjectEventPic_Archie, 2, 4, 8),
  ];
}

export function build_sPicTable_Maxie(gObjectEventPic_Maxie: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 0),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 1),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 2),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 3),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 4),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 5),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 6),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 7),
    overworld_frame(gObjectEventPic_Maxie, 2, 4, 8),
  ];
}

export function build_sPicTable_KyogreFront(gObjectEventPic_Kyogre: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 0),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 0),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 0),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 1),
  ];
}

export function build_sPicTable_GroudonFront(gObjectEventPic_Groudon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 0),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 0),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 0),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 1),
  ];
}

export function build_sPicTable_KyogreSide(gObjectEventPic_Kyogre: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 2),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 2),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 2),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
    overworld_frame(gObjectEventPic_Kyogre, 4, 4, 3),
  ];
}

export function build_sPicTable_GroudonSide(gObjectEventPic_Groudon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 2),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 2),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 2),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
    overworld_frame(gObjectEventPic_Groudon, 4, 4, 3),
  ];
}

export function build_sPicTable_Fossil(gObjectEventPic_Fossil: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_Fossil).
  return [
    { data: gObjectEventPic_Fossil, size: gObjectEventPic_Fossil.length },
  ];
}

export function build_sPicTable_Regi(gObjectEventPic_Regi: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp : 9× obj_frame_tiles(gObjectEventPic_Regi).
  const entry = { data: gObjectEventPic_Regi, size: gObjectEventPic_Regi.length };
  return [entry, entry, entry, entry, entry, entry, entry, entry, entry];
}

export function build_sPicTable_Skitty(gObjectEventPic_Skitty: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 0),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 1),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 2),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 0),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 0),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 1),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 1),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 2),
    overworld_frame(gObjectEventPic_Skitty, 2, 2, 2),
  ];
}

export function build_sPicTable_Kecleon(gObjectEventPic_Kecleon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 2),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 2),
    overworld_frame(gObjectEventPic_Kecleon, 2, 2, 2),
  ];
}

export function build_sPicTable_Rayquaza(gObjectEventPic_Rayquaza: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Rayquaza, 8, 8, 0),
    overworld_frame(gObjectEventPic_Rayquaza, 8, 8, 1),
    overworld_frame(gObjectEventPic_Rayquaza, 8, 8, 2),
    overworld_frame(gObjectEventPic_Rayquaza, 8, 8, 3),
    overworld_frame(gObjectEventPic_Rayquaza, 8, 8, 4),
  ];
}

export function build_sPicTable_RayquazaStill(gObjectEventPic_RayquazaStill: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp : 9× obj_frame_tiles(gObjectEventPic_RayquazaStill).
  const entry = { data: gObjectEventPic_RayquazaStill, size: gObjectEventPic_RayquazaStill.length };
  return [entry, entry, entry, entry, entry, entry, entry, entry, entry];
}

export function build_sPicTable_Zigzagoon(gObjectEventPic_Zigzagoon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 2),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 0),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 1),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 2),
    overworld_frame(gObjectEventPic_Zigzagoon, 2, 2, 2),
  ];
}

export function build_sPicTable_Pikachu(gObjectEventPic_Pikachu: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 0),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 1),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 2),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 0),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 0),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 1),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 1),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 2),
    overworld_frame(gObjectEventPic_Pikachu, 2, 2, 2),
  ];
}

export function build_sPicTable_Azumarill(gObjectEventPic_Azumarill: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 2),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 2),
    overworld_frame(gObjectEventPic_Azumarill, 2, 2, 2),
  ];
}

export function build_sPicTable_Wingull(gObjectEventPic_Wingull: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 0),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 2),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 4),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 1),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 1),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 3),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 3),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 5),
    overworld_frame(gObjectEventPic_Wingull, 2, 2, 5),
  ];
}

export function build_sPicTable_TuberMSwimming(gObjectEventPic_TuberMSwimming: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 0),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 1),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 2),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 3),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 4),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 5),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 6),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 7),
    overworld_frame(gObjectEventPic_TuberMSwimming, 2, 2, 8),
  ];
}

export function build_sPicTable_Azurill(gObjectEventPic_Azurill: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 2),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 0),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 1),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 2),
    overworld_frame(gObjectEventPic_Azurill, 2, 2, 2),
  ];
}

export function build_sPicTable_Mom(gObjectEventPic_Mom: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Mom, 2, 4, 0),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 1),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 2),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 3),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 4),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 5),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 6),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 7),
    overworld_frame(gObjectEventPic_Mom, 2, 4, 8),
  ];
}

export function build_sPicTable_Scott(gObjectEventPic_Scott: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Scott, 2, 4, 0),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 1),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 2),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 3),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 4),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 5),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 6),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 7),
    overworld_frame(gObjectEventPic_Scott, 2, 4, 8),
  ];
}

export function build_sPicTable_Juan(gObjectEventPic_Juan: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Juan, 2, 4, 0),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 1),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 2),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 3),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 4),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 5),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 6),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 7),
    overworld_frame(gObjectEventPic_Juan, 2, 4, 8),
  ];
}

export function build_sPicTable_MysteryEventDeliveryman(gObjectEventPic_MysteryEventDeliveryman: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 0),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 1),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 2),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 0),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 0),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 1),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 1),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 2),
    overworld_frame(gObjectEventPic_MysteryEventDeliveryman, 2, 4, 2),
  ];
}

export function build_sPicTable_Statue(gObjectEventPic_Statue: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_Statue).
  return [
    { data: gObjectEventPic_Statue, size: gObjectEventPic_Statue.length },
  ];
}

export function build_sPicTable_Dusclops(gObjectEventPic_Dusclops: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 0),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 1),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 2),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 3),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 4),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 5),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 6),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 7),
    overworld_frame(gObjectEventPic_Dusclops, 2, 4, 8),
  ];
}

export function build_sPicTable_Kirlia(gObjectEventPic_Kirlia: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 0),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 1),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 2),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 3),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 4),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 5),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 6),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 7),
    overworld_frame(gObjectEventPic_Kirlia, 2, 4, 8),
  ];
}

export function build_sPicTable_UnionRoomAttendant(gObjectEventPic_UnionRoomAttendant: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 0),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 1),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 2),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 0),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 0),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 1),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 1),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 2),
    overworld_frame(gObjectEventPic_UnionRoomAttendant, 2, 4, 2),
  ];
}

export function build_sPicTable_Sudowoodo(gObjectEventPic_Sudowoodo: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 0),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 1),
    overworld_frame(gObjectEventPic_Sudowoodo, 2, 4, 2),
  ];
}

export function build_sPicTable_Mew(gObjectEventPic_Mew: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Mew, 2, 4, 0),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 1),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 2),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 3),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 4),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 5),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 6),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 7),
    overworld_frame(gObjectEventPic_Mew, 2, 4, 8),
  ];
}

export function build_sPicTable_Red(gObjectEventPic_Red: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Red, 2, 4, 0),
    overworld_frame(gObjectEventPic_Red, 2, 4, 1),
    overworld_frame(gObjectEventPic_Red, 2, 4, 2),
    overworld_frame(gObjectEventPic_Red, 2, 4, 3),
    overworld_frame(gObjectEventPic_Red, 2, 4, 4),
    overworld_frame(gObjectEventPic_Red, 2, 4, 5),
    overworld_frame(gObjectEventPic_Red, 2, 4, 6),
    overworld_frame(gObjectEventPic_Red, 2, 4, 7),
    overworld_frame(gObjectEventPic_Red, 2, 4, 8),
  ];
}

export function build_sPicTable_Leaf(gObjectEventPic_Leaf: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 0),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 1),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 2),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 3),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 4),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 5),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 6),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 7),
    overworld_frame(gObjectEventPic_Leaf, 2, 4, 8),
  ];
}

export function build_sPicTable_Deoxys(gObjectEventPic_Deoxys: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 1),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 1),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
    overworld_frame(gObjectEventPic_Deoxys, 4, 4, 0),
  ];
}

export function build_sPicTable_BirthIslandStone(gObjectEventPic_BirthIslandStone: Uint8Array): SpriteFrameImage[] {
  // 1:1 décomp obj_frame_tiles(gObjectEventPic_BirthIslandStone).
  return [
    { data: gObjectEventPic_BirthIslandStone, size: gObjectEventPic_BirthIslandStone.length },
  ];
}

export function build_sPicTable_Anabel(gObjectEventPic_Anabel: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 0),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 1),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 2),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 3),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 4),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 5),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 6),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 7),
    overworld_frame(gObjectEventPic_Anabel, 2, 4, 8),
  ];
}

export function build_sPicTable_Tucker(gObjectEventPic_Tucker: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 0),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 1),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 2),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 3),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 4),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 5),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 6),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 7),
    overworld_frame(gObjectEventPic_Tucker, 2, 4, 8),
  ];
}

export function build_sPicTable_Spenser(gObjectEventPic_Spenser: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 0),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 1),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 2),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 3),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 4),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 5),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 6),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 7),
    overworld_frame(gObjectEventPic_Spenser, 2, 4, 8),
  ];
}

export function build_sPicTable_Greta(gObjectEventPic_Greta: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Greta, 2, 4, 0),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 1),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 2),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 3),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 4),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 5),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 6),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 7),
    overworld_frame(gObjectEventPic_Greta, 2, 4, 8),
  ];
}

export function build_sPicTable_Noland(gObjectEventPic_Noland: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Noland, 2, 4, 0),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 1),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 2),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 3),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 4),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 5),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 6),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 7),
    overworld_frame(gObjectEventPic_Noland, 2, 4, 8),
  ];
}

export function build_sPicTable_Lucy(gObjectEventPic_Lucy: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 0),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 1),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 2),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 3),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 4),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 5),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 6),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 7),
    overworld_frame(gObjectEventPic_Lucy, 2, 4, 8),
  ];
}

export function build_sPicTable_Brandon(gObjectEventPic_Brandon: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 0),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 1),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 2),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 3),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 4),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 5),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 6),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 7),
    overworld_frame(gObjectEventPic_Brandon, 2, 4, 8),
  ];
}

export function build_sPicTable_Lugia(gObjectEventPic_Lugia: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 1),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 1),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 0),
    overworld_frame(gObjectEventPic_Lugia, 4, 4, 1),
  ];
}

export function build_sPicTable_HoOh(gObjectEventPic_HoOh: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 1),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 1),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 0),
    overworld_frame(gObjectEventPic_HoOh, 4, 4, 1),
  ];
}

export function build_sPicTable_RubySapphireBrendan(gObjectEventPic_RubySapphireBrendanNormal: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 0),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 1),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 2),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 3),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 4),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 5),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 6),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 7),
    overworld_frame(gObjectEventPic_RubySapphireBrendanNormal, 2, 4, 8),
  ];
}

export function build_sPicTable_RubySapphireMay(gObjectEventPic_RubySapphireMayNormal: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 0),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 1),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 2),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 3),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 4),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 5),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 6),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 7),
    overworld_frame(gObjectEventPic_RubySapphireMayNormal, 2, 4, 8),
  ];
}

export function build_sPicTable_PechaBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PechaBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_PechaBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_KelpsyBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_KelpsyBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_KelpsyBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_WepearBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_WepearBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_WepearBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_IapapaBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_IapapaBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_IapapaBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_CheriBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_CheriBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_CheriBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_FigyBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_FigyBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_FigyBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_MagoBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_MagoBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_MagoBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_LumBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_LumBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_LumBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_RazzBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_RazzBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_RazzBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_GrepaBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_GrepaBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_GrepaBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_RabutaBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_RabutaBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_RabutaBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_NomelBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_NomelBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_NomelBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_LeppaBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_LeppaBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_LeppaBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_LiechiBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_LiechiBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_LiechiBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_HondewBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_HondewBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_HondewBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_AguavBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_AguavBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_AguavBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_WikiBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_WikiBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_WikiBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_PomegBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PomegBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_PomegBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_RawstBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_RawstBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_RawstBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_SpelonBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_SpelonBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_SpelonBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_ChestoBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_ChestoBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_ChestoBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_OranBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_OranBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_OranBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_PersimBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PersimBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_PersimBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_SitrusBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_SitrusBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_SitrusBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_AspearBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_AspearBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_AspearBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_PamtreBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PamtreBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_PamtreBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_CornnBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_CornnBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_CornnBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_LansatBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_LansatBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_LansatBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_DurinBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_DurinBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_DurinBerryTree, 2, 4, 5),
  ];
}

export function build_sPicTable_TamatoBerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_TamatoBerryTree: Uint8Array): SpriteFrameImage[] {
  return [
    overworld_frame(gObjectEventPic_BerryTreeDirtPile, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 0),
    overworld_frame(gObjectEventPic_BerryTreeSprout, 2, 2, 1),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 0),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 1),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 2),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 3),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 4),
    overworld_frame(gObjectEventPic_TamatoBerryTree, 2, 4, 5),
  ];
}

// ─── gObjectEventGraphicsInfo_* factories 1:1 décomp graphics_info.h ───────

export function build_gObjectEventGraphicsInfo_BrendanNormal(gObjectEventPic_BrendanNormal: Uint8Array, gObjectEventPic_BrendanRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_BrendanNormal(gObjectEventPic_BrendanNormal, gObjectEventPic_BrendanRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanMachBike(gObjectEventPic_BrendanMachBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BrendanMachBike(gObjectEventPic_BrendanMachBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanAcroBike(gObjectEventPic_BrendanAcroBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_BrendanAcroBike(gObjectEventPic_BrendanAcroBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanSurfing(gObjectEventPic_BrendanSurfing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Surfing as unknown as unknown[],
    images: build_sPicTable_BrendanSurfing(gObjectEventPic_BrendanSurfing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanFieldMove(gObjectEventPic_BrendanFieldMove: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_FieldMove as unknown as unknown[],
    images: build_sPicTable_BrendanFieldMove(gObjectEventPic_BrendanFieldMove),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_QuintyPlump(gObjectEventPic_QuintyPlump: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_QUINTY_PLUMP,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_L,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_QuintyPlump as unknown as unknown[],
    images: build_sPicTable_QuintyPlump(gObjectEventPic_QuintyPlump),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_NinjaBoy(gObjectEventPic_NinjaBoy: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_NinjaBoy(gObjectEventPic_NinjaBoy),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Twin(gObjectEventPic_Twin: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Twin(gObjectEventPic_Twin),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Boy1(gObjectEventPic_Boy1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Boy1(gObjectEventPic_Boy1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Girl1(gObjectEventPic_Girl1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Girl1(gObjectEventPic_Girl1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Boy2(gObjectEventPic_Boy2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Boy2(gObjectEventPic_Boy2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Girl2(gObjectEventPic_Girl2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Girl2(gObjectEventPic_Girl2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LittleBoy(gObjectEventPic_LittleBoy: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_LittleBoy(gObjectEventPic_LittleBoy),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LittleGirl(gObjectEventPic_LittleGirl: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_LittleGirl(gObjectEventPic_LittleGirl),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Boy3(gObjectEventPic_Boy3: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Boy3(gObjectEventPic_Boy3),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Girl3(gObjectEventPic_Girl3: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Girl3(gObjectEventPic_Girl3),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RichBoy(gObjectEventPic_RichBoy: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RichBoy(gObjectEventPic_RichBoy),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Woman1(gObjectEventPic_Woman1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Woman1(gObjectEventPic_Woman1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_FatMan(gObjectEventPic_FatMan: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_FatMan(gObjectEventPic_FatMan),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PokefanF(gObjectEventPic_PokefanF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_PokefanF(gObjectEventPic_PokefanF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Man1(gObjectEventPic_Man1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Man1(gObjectEventPic_Man1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Woman2(gObjectEventPic_Woman2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Woman2(gObjectEventPic_Woman2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ExpertM(gObjectEventPic_ExpertM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ExpertM(gObjectEventPic_ExpertM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ExpertF(gObjectEventPic_ExpertF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ExpertF(gObjectEventPic_ExpertF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Man2(gObjectEventPic_Man2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Man2(gObjectEventPic_Man2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Woman3(gObjectEventPic_Woman3: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Woman3(gObjectEventPic_Woman3),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PokefanM(gObjectEventPic_PokefanM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_PokefanM(gObjectEventPic_PokefanM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Woman4(gObjectEventPic_Woman4: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Woman4(gObjectEventPic_Woman4),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Cook(gObjectEventPic_Cook: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Cook(gObjectEventPic_Cook),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LinkReceptionist(gObjectEventPic_LinkReceptionist: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_LinkReceptionist(gObjectEventPic_LinkReceptionist),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_OldMan(gObjectEventPic_OldMan: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_OldMan(gObjectEventPic_OldMan),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_OldWoman(gObjectEventPic_OldWoman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_OldWoman(gObjectEventPic_OldWoman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Camper(gObjectEventPic_Camper: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Camper(gObjectEventPic_Camper),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Picnicker(gObjectEventPic_Picnicker: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Picnicker(gObjectEventPic_Picnicker),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Man3(gObjectEventPic_Man3: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Man3(gObjectEventPic_Man3),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Woman5(gObjectEventPic_Woman5: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Woman5(gObjectEventPic_Woman5),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Youngster(gObjectEventPic_Youngster: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Youngster(gObjectEventPic_Youngster),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BugCatcher(gObjectEventPic_BugCatcher: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BugCatcher(gObjectEventPic_BugCatcher),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PsychicM(gObjectEventPic_PsychicM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_PsychicM(gObjectEventPic_PsychicM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SchoolKidM(gObjectEventPic_SchoolKidM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_SchoolKidM(gObjectEventPic_SchoolKidM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Maniac(gObjectEventPic_Maniac: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Maniac(gObjectEventPic_Maniac),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_HexManiac(gObjectEventPic_HexManiac: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_HexManiac(gObjectEventPic_HexManiac),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RayquazaStill(gObjectEventPic_RayquazaStill: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 2048,
    width: 64,
    height: 64,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_64x64,
    subspriteTables: sOamTables_64x64 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RayquazaStill(gObjectEventPic_RayquazaStill),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SwimmerM(gObjectEventPic_SwimmerM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_SwimmerM(gObjectEventPic_SwimmerM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SwimmerF(gObjectEventPic_SwimmerF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_SwimmerF(gObjectEventPic_SwimmerF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BlackBelt(gObjectEventPic_BlackBelt: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BlackBelt(gObjectEventPic_BlackBelt),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Beauty(gObjectEventPic_Beauty: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Beauty(gObjectEventPic_Beauty),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Scientist1(gObjectEventPic_Scientist1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Scientist1(gObjectEventPic_Scientist1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Lass(gObjectEventPic_Lass: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Lass(gObjectEventPic_Lass),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Gentleman(gObjectEventPic_Gentleman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Gentleman(gObjectEventPic_Gentleman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Sailor(gObjectEventPic_Sailor: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Sailor(gObjectEventPic_Sailor),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Fisherman(gObjectEventPic_Fisherman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Fisherman(gObjectEventPic_Fisherman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RunningTriathleteM(gObjectEventPic_RunningTriathleteM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RunningTriathleteM(gObjectEventPic_RunningTriathleteM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RunningTriathleteF(gObjectEventPic_RunningTriathleteF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RunningTriathleteF(gObjectEventPic_RunningTriathleteF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TuberF(gObjectEventPic_TuberF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_TuberF(gObjectEventPic_TuberF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TuberM(gObjectEventPic_TuberM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_TuberM(gObjectEventPic_TuberM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Hiker(gObjectEventPic_Hiker: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Hiker(gObjectEventPic_Hiker),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_CyclingTriathleteM(gObjectEventPic_CyclingTriathleteM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_CyclingTriathleteM(gObjectEventPic_CyclingTriathleteM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_CyclingTriathleteF(gObjectEventPic_CyclingTriathleteF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_CyclingTriathleteF(gObjectEventPic_CyclingTriathleteF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Nurse(gObjectEventPic_Nurse: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Nurse as unknown as unknown[],
    images: build_sPicTable_Nurse(gObjectEventPic_Nurse),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ItemBall(gObjectEventPic_ItemBall: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_ItemBall(gObjectEventPic_ItemBall),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BerryTree(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PechaBerryTree: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: null,
    anims: sAnimTable_BerryTree as unknown as unknown[],
    images: build_sPicTable_PechaBerryTree(gObjectEventPic_BerryTreeDirtPile, gObjectEventPic_BerryTreeSprout, gObjectEventPic_PechaBerryTree),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BerryTreeEarlyStages(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PechaBerryTree: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_BerryTree as unknown as unknown[],
    images: build_sPicTable_PechaBerryTree(gObjectEventPic_BerryTreeDirtPile, gObjectEventPic_BerryTreeSprout, gObjectEventPic_PechaBerryTree),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BerryTreeLateStages(gObjectEventPic_BerryTreeDirtPile: Uint8Array, gObjectEventPic_BerryTreeSprout: Uint8Array, gObjectEventPic_PechaBerryTree: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BerryTree as unknown as unknown[],
    images: build_sPicTable_PechaBerryTree(gObjectEventPic_BerryTreeDirtPile, gObjectEventPic_BerryTreeSprout, gObjectEventPic_PechaBerryTree),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ProfBirch(gObjectEventPic_ProfBirch: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ProfBirch(gObjectEventPic_ProfBirch),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Man4(gObjectEventPic_Man4: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Man4(gObjectEventPic_Man4),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Man5(gObjectEventPic_Man5: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Man5(gObjectEventPic_Man5),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ReporterM(gObjectEventPic_ReporterM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ReporterM(gObjectEventPic_ReporterM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ReporterF(gObjectEventPic_ReporterF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ReporterF(gObjectEventPic_ReporterF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Bard(gObjectEventPic_MauvilleOldMan1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan1(gObjectEventPic_MauvilleOldMan1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Hipster(gObjectEventPic_MauvilleOldMan1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan1(gObjectEventPic_MauvilleOldMan1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Trader(gObjectEventPic_MauvilleOldMan1: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan1(gObjectEventPic_MauvilleOldMan1),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Storyteller(gObjectEventPic_MauvilleOldMan2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan2(gObjectEventPic_MauvilleOldMan2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Giddy(gObjectEventPic_MauvilleOldMan2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan2(gObjectEventPic_MauvilleOldMan2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedMauvilleOldMan1(gObjectEventPic_MauvilleOldMan2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan2(gObjectEventPic_MauvilleOldMan2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedMauvilleOldMan2(gObjectEventPic_MauvilleOldMan2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MauvilleOldMan2(gObjectEventPic_MauvilleOldMan2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedNatuDoll(gObjectEventPic_UnusedNatuDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedNatuDoll(gObjectEventPic_UnusedNatuDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedMagnemiteDoll(gObjectEventPic_UnusedMagnemiteDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedMagnemiteDoll(gObjectEventPic_UnusedMagnemiteDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedSquirtleDoll(gObjectEventPic_UnusedSquirtleDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedSquirtleDoll(gObjectEventPic_UnusedSquirtleDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedWooperDoll(gObjectEventPic_UnusedWooperDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedWooperDoll(gObjectEventPic_UnusedWooperDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedPikachuDoll(gObjectEventPic_UnusedPikachuDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedPikachuDoll(gObjectEventPic_UnusedPikachuDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnusedPorygon2Doll(gObjectEventPic_UnusedPorygon2Doll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_UnusedPorygon2Doll(gObjectEventPic_UnusedPorygon2Doll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_CuttableTree(gObjectEventPic_CuttableTree: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_CuttableTree as unknown as unknown[],
    images: build_sPicTable_CuttableTree(gObjectEventPic_CuttableTree),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MartEmployee(gObjectEventPic_MartEmployee: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MartEmployee(gObjectEventPic_MartEmployee),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RooftopSaleWoman(gObjectEventPic_RooftopSaleWoman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RooftopSaleWoman(gObjectEventPic_RooftopSaleWoman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Teala(gObjectEventPic_Teala: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Teala(gObjectEventPic_Teala),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BreakableRock(gObjectEventPic_BreakableRock: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_BreakableRock as unknown as unknown[],
    images: build_sPicTable_BreakableRock(gObjectEventPic_BreakableRock),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PushableBoulder(gObjectEventPic_PushableBoulder: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_PushableBoulder(gObjectEventPic_PushableBoulder),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MrBrineysBoat(gObjectEventPic_MrBrineysBoat: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MrBrineysBoat(gObjectEventPic_MrBrineysBoat),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayNormal(gObjectEventPic_MayNormal: Uint8Array, gObjectEventPic_MayRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_MayNormal(gObjectEventPic_MayNormal, gObjectEventPic_MayRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayMachBike(gObjectEventPic_MayMachBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MayMachBike(gObjectEventPic_MayMachBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayAcroBike(gObjectEventPic_MayAcroBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_MayAcroBike(gObjectEventPic_MayAcroBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MaySurfing(gObjectEventPic_MaySurfing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Surfing as unknown as unknown[],
    images: build_sPicTable_MaySurfing(gObjectEventPic_MaySurfing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayFieldMove(gObjectEventPic_MayFieldMove: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_FieldMove as unknown as unknown[],
    images: build_sPicTable_MayFieldMove(gObjectEventPic_MayFieldMove),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Truck(gObjectEventPic_Truck: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_TRUCK,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 1152,
    width: 48,
    height: 48,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_48x48 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_Truck(gObjectEventPic_Truck),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_VigorothCarryingBox(gObjectEventPic_Vigoroth: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_VIGOROTH,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_VigorothCarryingBox(gObjectEventPic_Vigoroth),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_VigorothFacingAway(gObjectEventPic_Vigoroth: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_VIGOROTH,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_VigorothFacingAway(gObjectEventPic_Vigoroth),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BirchsBag(gObjectEventPic_BirchsBag: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BirchsBag(gObjectEventPic_BirchsBag),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_EnemyZigzagoon(gObjectEventPic_EnemyZigzagoon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_ZIGZAGOON,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_EnemyZigzagoon(gObjectEventPic_EnemyZigzagoon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Poochyena(gObjectEventPic_Poochyena: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_POOCHYENA,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Poochyena(gObjectEventPic_Poochyena),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Artist(gObjectEventPic_Artist: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Artist(gObjectEventPic_Artist),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalBrendanNormal(gObjectEventPic_BrendanNormal: Uint8Array, gObjectEventPic_BrendanRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_BrendanNormal(gObjectEventPic_BrendanNormal, gObjectEventPic_BrendanRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalBrendanMachBike(gObjectEventPic_BrendanMachBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BrendanMachBike(gObjectEventPic_BrendanMachBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalBrendanAcroBike(gObjectEventPic_BrendanAcroBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_BrendanAcroBike(gObjectEventPic_BrendanAcroBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalBrendanSurfing(gObjectEventPic_BrendanSurfing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Surfing as unknown as unknown[],
    images: build_sPicTable_BrendanSurfing(gObjectEventPic_BrendanSurfing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalBrendanFieldMove(gObjectEventPic_BrendanFieldMove: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_FieldMove as unknown as unknown[],
    images: build_sPicTable_BrendanFieldMove(gObjectEventPic_BrendanFieldMove),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalMayNormal(gObjectEventPic_MayNormal: Uint8Array, gObjectEventPic_MayRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_MayNormal(gObjectEventPic_MayNormal, gObjectEventPic_MayRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalMayMachBike(gObjectEventPic_MayMachBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MayMachBike(gObjectEventPic_MayMachBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalMayAcroBike(gObjectEventPic_MayAcroBike: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_BIKE_TIRE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_AcroBike as unknown as unknown[],
    images: build_sPicTable_MayAcroBike(gObjectEventPic_MayAcroBike),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalMaySurfing(gObjectEventPic_MaySurfing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Surfing as unknown as unknown[],
    images: build_sPicTable_MaySurfing(gObjectEventPic_MaySurfing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RivalMayFieldMove(gObjectEventPic_MayFieldMove: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_FieldMove as unknown as unknown[],
    images: build_sPicTable_MayFieldMove(gObjectEventPic_MayFieldMove),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Cameraman(gObjectEventPic_Cameraman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Cameraman(gObjectEventPic_Cameraman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanUnderwater(gObjectEventPic_BrendanUnderwater: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BrendanUnderwater(gObjectEventPic_BrendanUnderwater),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayUnderwater(gObjectEventPic_MayUnderwater: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MayUnderwater(gObjectEventPic_MayUnderwater),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MovingBox(gObjectEventPic_MovingBox: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MOVING_BOX,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_MovingBox(gObjectEventPic_MovingBox),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_CableCar(gObjectEventPic_CableCar: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_CABLE_CAR,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 2048,
    width: 64,
    height: 64,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_64x64,
    subspriteTables: sOamTables_64x64 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_CableCar(gObjectEventPic_CableCar),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Scientist2(gObjectEventPic_Scientist2: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Scientist2(gObjectEventPic_Scientist2),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_DevonEmployee(gObjectEventPic_DevonEmployee: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_DevonEmployee(gObjectEventPic_DevonEmployee),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_AquaMemberM(gObjectEventPic_AquaMemberM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_AquaMemberM(gObjectEventPic_AquaMemberM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_AquaMemberF(gObjectEventPic_AquaMemberF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_AquaMemberF(gObjectEventPic_AquaMemberF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MagmaMemberM(gObjectEventPic_MagmaMemberM: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MagmaMemberM(gObjectEventPic_MagmaMemberM),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MagmaMemberF(gObjectEventPic_MagmaMemberF: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MagmaMemberF(gObjectEventPic_MagmaMemberF),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Sidney(gObjectEventPic_Sidney: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Sidney(gObjectEventPic_Sidney),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Phoebe(gObjectEventPic_Phoebe: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Phoebe(gObjectEventPic_Phoebe),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Glacia(gObjectEventPic_Glacia: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Glacia(gObjectEventPic_Glacia),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Drake(gObjectEventPic_Drake: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Drake(gObjectEventPic_Drake),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Roxanne(gObjectEventPic_Roxanne: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Roxanne(gObjectEventPic_Roxanne),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Brawly(gObjectEventPic_Brawly: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Brawly(gObjectEventPic_Brawly),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Wattson(gObjectEventPic_Wattson: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Wattson(gObjectEventPic_Wattson),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Flannery(gObjectEventPic_Flannery: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Flannery(gObjectEventPic_Flannery),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Norman(gObjectEventPic_Norman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Norman(gObjectEventPic_Norman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Winona(gObjectEventPic_Winona: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Winona(gObjectEventPic_Winona),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Liza(gObjectEventPic_Liza: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Liza(gObjectEventPic_Liza),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Tate(gObjectEventPic_Tate: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Tate(gObjectEventPic_Tate),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Wallace(gObjectEventPic_Wallace: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Wallace(gObjectEventPic_Wallace),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Steven(gObjectEventPic_Steven: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Steven(gObjectEventPic_Steven),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Wally(gObjectEventPic_Wally: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Wally(gObjectEventPic_Wally),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RubySapphireLittleBoy(gObjectEventPic_RubySapphireLittleBoy: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RubySapphireLittleBoy(gObjectEventPic_RubySapphireLittleBoy),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanFishing(gObjectEventPic_BrendanFishing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Fishing as unknown as unknown[],
    images: build_sPicTable_BrendanFishing(gObjectEventPic_BrendanFishing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayFishing(gObjectEventPic_MayFishing: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Fishing as unknown as unknown[],
    images: build_sPicTable_MayFishing(gObjectEventPic_MayFishing),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_HotSpringsOldWoman(gObjectEventPic_HotSpringsOldWoman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_HotSpringsOldWoman(gObjectEventPic_HotSpringsOldWoman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SSTidal(gObjectEventPic_SSTidal: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_SSTIDAL,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 1920,
    width: 96,
    height: 40,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_8x8,
    subspriteTables: sOamTables_96x40 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_SSTidal(gObjectEventPic_SSTidal),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SubmarineShadow(gObjectEventPic_SubmarineShadow: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 1408,
    width: 88,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_8x8,
    subspriteTables: sOamTables_88x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_SubmarineShadow(gObjectEventPic_SubmarineShadow),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PichuDoll(gObjectEventPic_PichuDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_PichuDoll(gObjectEventPic_PichuDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PikachuDoll(gObjectEventPic_PikachuDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_PikachuDoll(gObjectEventPic_PikachuDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MarillDoll(gObjectEventPic_MarillDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_MarillDoll(gObjectEventPic_MarillDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TogepiDoll(gObjectEventPic_TogepiDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_TogepiDoll(gObjectEventPic_TogepiDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_CyndaquilDoll(gObjectEventPic_CyndaquilDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_CyndaquilDoll(gObjectEventPic_CyndaquilDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ChikoritaDoll(gObjectEventPic_ChikoritaDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_ChikoritaDoll(gObjectEventPic_ChikoritaDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TotodileDoll(gObjectEventPic_TotodileDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_TotodileDoll(gObjectEventPic_TotodileDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_JigglypuffDoll(gObjectEventPic_JigglypuffDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_JigglypuffDoll(gObjectEventPic_JigglypuffDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MeowthDoll(gObjectEventPic_MeowthDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_MeowthDoll(gObjectEventPic_MeowthDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ClefairyDoll(gObjectEventPic_ClefairyDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_ClefairyDoll(gObjectEventPic_ClefairyDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_DittoDoll(gObjectEventPic_DittoDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_DittoDoll(gObjectEventPic_DittoDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SmoochumDoll(gObjectEventPic_SmoochumDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_SmoochumDoll(gObjectEventPic_SmoochumDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TreeckoDoll(gObjectEventPic_TreeckoDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_TreeckoDoll(gObjectEventPic_TreeckoDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TorchicDoll(gObjectEventPic_TorchicDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_TorchicDoll(gObjectEventPic_TorchicDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MudkipDoll(gObjectEventPic_MudkipDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_MudkipDoll(gObjectEventPic_MudkipDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_DuskullDoll(gObjectEventPic_DuskullDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_DuskullDoll(gObjectEventPic_DuskullDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_WynautDoll(gObjectEventPic_WynautDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_WynautDoll(gObjectEventPic_WynautDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BaltoyDoll(gObjectEventPic_BaltoyDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BaltoyDoll(gObjectEventPic_BaltoyDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KecleonDoll(gObjectEventPic_KecleonDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_KecleonDoll(gObjectEventPic_KecleonDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_AzurillDoll(gObjectEventPic_AzurillDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_AzurillDoll(gObjectEventPic_AzurillDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SkittyDoll(gObjectEventPic_SkittyDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_SkittyDoll(gObjectEventPic_SkittyDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SwabluDoll(gObjectEventPic_SwabluDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_SwabluDoll(gObjectEventPic_SwabluDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GulpinDoll(gObjectEventPic_GulpinDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_GulpinDoll(gObjectEventPic_GulpinDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LotadDoll(gObjectEventPic_LotadDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_LotadDoll(gObjectEventPic_LotadDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SeedotDoll(gObjectEventPic_SeedotDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_SeedotDoll(gObjectEventPic_SeedotDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_PikaCushion(gObjectEventPic_PikaCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_PikaCushion(gObjectEventPic_PikaCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RoundCushion(gObjectEventPic_RoundCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_RoundCushion(gObjectEventPic_RoundCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KissCushion(gObjectEventPic_KissCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_KissCushion(gObjectEventPic_KissCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ZigzagCushion(gObjectEventPic_ZigzagCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_ZigzagCushion(gObjectEventPic_ZigzagCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_SpinCushion(gObjectEventPic_SpinCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_SpinCushion(gObjectEventPic_SpinCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_DiamondCushion(gObjectEventPic_DiamondCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_DiamondCushion(gObjectEventPic_DiamondCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BallCushion(gObjectEventPic_BallCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BallCushion(gObjectEventPic_BallCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GrassCushion(gObjectEventPic_GrassCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_GrassCushion(gObjectEventPic_GrassCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_FireCushion(gObjectEventPic_FireCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_FireCushion(gObjectEventPic_FireCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_WaterCushion(gObjectEventPic_WaterCushion: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_WaterCushion(gObjectEventPic_WaterCushion),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigSnorlaxDoll(gObjectEventPic_BigSnorlaxDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigSnorlaxDoll(gObjectEventPic_BigSnorlaxDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigRhydonDoll(gObjectEventPic_BigRhydonDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigRhydonDoll(gObjectEventPic_BigRhydonDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigLaprasDoll(gObjectEventPic_BigLaprasDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigLaprasDoll(gObjectEventPic_BigLaprasDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigVenusaurDoll(gObjectEventPic_BigVenusaurDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigVenusaurDoll(gObjectEventPic_BigVenusaurDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigCharizardDoll(gObjectEventPic_BigCharizardDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigCharizardDoll(gObjectEventPic_BigCharizardDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigBlastoiseDoll(gObjectEventPic_BigBlastoiseDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigBlastoiseDoll(gObjectEventPic_BigBlastoiseDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigWailmerDoll(gObjectEventPic_BigWailmerDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigWailmerDoll(gObjectEventPic_BigWailmerDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigRegirockDoll(gObjectEventPic_BigRegirockDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigRegirockDoll(gObjectEventPic_BigRegirockDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigRegiceDoll(gObjectEventPic_BigRegiceDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigRegiceDoll(gObjectEventPic_BigRegiceDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BigRegisteelDoll(gObjectEventPic_BigRegisteelDoll: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BigRegisteelDoll(gObjectEventPic_BigRegisteelDoll),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Latias(gObjectEventPic_LatiasLatios: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_LatiasLatios(gObjectEventPic_LatiasLatios),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Latios(gObjectEventPic_LatiasLatios: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_LatiasLatios(gObjectEventPic_LatiasLatios),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GameboyKid(gObjectEventPic_GameboyKid: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_GameboyKid(gObjectEventPic_GameboyKid),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_ContestJudge(gObjectEventPic_ContestJudge: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_ContestJudge(gObjectEventPic_ContestJudge),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanWatering(gObjectEventPic_BrendanWatering: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_BrendanWatering(gObjectEventPic_BrendanWatering),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayWatering(gObjectEventPic_MayWatering: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_PLAYER,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MayWatering(gObjectEventPic_MayWatering),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BrendanDecorating(gObjectEventPic_BrendanDecorating: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BrendanDecorating(gObjectEventPic_BrendanDecorating),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MayDecorating(gObjectEventPic_MayDecorating: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_MayDecorating(gObjectEventPic_MayDecorating),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Archie(gObjectEventPic_Archie: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Archie(gObjectEventPic_Archie),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Maxie(gObjectEventPic_Maxie: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Maxie(gObjectEventPic_Maxie),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KyogreFront(gObjectEventPic_Kyogre: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_KyogreFront(gObjectEventPic_Kyogre),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GroudonFront(gObjectEventPic_Groudon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_GroudonFront(gObjectEventPic_Groudon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KyogreSide(gObjectEventPic_Kyogre: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_KyogreSide(gObjectEventPic_Kyogre),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GroudonSide(gObjectEventPic_Groudon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_GroudonSide as unknown as unknown[],
    images: build_sPicTable_GroudonSide(gObjectEventPic_Groudon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Fossil(gObjectEventPic_Fossil: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_NONE,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_Fossil(gObjectEventPic_Fossil),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Regirock(gObjectEventPic_Regi: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Regi(gObjectEventPic_Regi),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Regice(gObjectEventPic_Regi: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Regi(gObjectEventPic_Regi),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Registeel(gObjectEventPic_Regi: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Regi(gObjectEventPic_Regi),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Skitty(gObjectEventPic_Skitty: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Skitty(gObjectEventPic_Skitty),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Kecleon(gObjectEventPic_Kecleon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Kecleon(gObjectEventPic_Kecleon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KyogreAsleep(gObjectEventPic_Kyogre: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_KYOGRE,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_KyogreFront(gObjectEventPic_Kyogre),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_GroudonAsleep(gObjectEventPic_Groudon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_GROUDON,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_GroudonFront(gObjectEventPic_Groudon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Rayquaza(gObjectEventPic_Rayquaza: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 2048,
    width: 64,
    height: 64,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 1,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_64x64,
    subspriteTables: sOamTables_64x64 as unknown as unknown[],
    anims: sAnimTable_Rayquaza as unknown as unknown[],
    images: build_sPicTable_Rayquaza(gObjectEventPic_Rayquaza),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Zigzagoon(gObjectEventPic_Zigzagoon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Zigzagoon(gObjectEventPic_Zigzagoon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Pikachu(gObjectEventPic_Pikachu: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Pikachu(gObjectEventPic_Pikachu),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Azumarill(gObjectEventPic_Azumarill: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Azumarill(gObjectEventPic_Azumarill),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Wingull(gObjectEventPic_Wingull: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Wingull(gObjectEventPic_Wingull),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_KecleonBridgeShadow(gObjectEventPic_Kecleon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Kecleon(gObjectEventPic_Kecleon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_TuberMSwimming(gObjectEventPic_TuberMSwimming: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_2,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_2,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_TuberMSwimming(gObjectEventPic_TuberMSwimming),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Azurill(gObjectEventPic_Azurill: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 128,
    width: 16,
    height: 16,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x16,
    subspriteTables: sOamTables_16x16 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Azurill(gObjectEventPic_Azurill),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Mom(gObjectEventPic_Mom: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Mom(gObjectEventPic_Mom),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LinkBrendan(gObjectEventPic_BrendanNormal: Uint8Array, gObjectEventPic_BrendanRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_BrendanNormal(gObjectEventPic_BrendanNormal, gObjectEventPic_BrendanRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_LinkMay(gObjectEventPic_MayNormal: Uint8Array, gObjectEventPic_MayRunning: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_BrendanMayNormal as unknown as unknown[],
    images: build_sPicTable_MayNormal(gObjectEventPic_MayNormal, gObjectEventPic_MayRunning),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Juan(gObjectEventPic_Juan: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Juan(gObjectEventPic_Juan),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Scott(gObjectEventPic_Scott: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Scott(gObjectEventPic_Scott),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_MysteryEventDeliveryman(gObjectEventPic_MysteryEventDeliveryman: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_MysteryEventDeliveryman(gObjectEventPic_MysteryEventDeliveryman),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Statue(gObjectEventPic_Statue: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_Statue(gObjectEventPic_Statue),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Kirlia(gObjectEventPic_Kirlia: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_S,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Kirlia(gObjectEventPic_Kirlia),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Dusclops(gObjectEventPic_Dusclops: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Dusclops(gObjectEventPic_Dusclops),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_UnionRoomAttendant(gObjectEventPic_UnionRoomAttendant: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_UnionRoomAttendant(gObjectEventPic_UnionRoomAttendant),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Red(gObjectEventPic_Red: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_RED_LEAF,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Red(gObjectEventPic_Red),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Leaf(gObjectEventPic_Leaf: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_RED_LEAF,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Leaf(gObjectEventPic_Leaf),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Sudowoodo(gObjectEventPic_Sudowoodo: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Sudowoodo(gObjectEventPic_Sudowoodo),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Mew(gObjectEventPic_Mew: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Mew(gObjectEventPic_Mew),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Deoxys(gObjectEventPic_Deoxys: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_DEOXYS,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Deoxys(gObjectEventPic_Deoxys),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_BirthIslandStone(gObjectEventPic_BirthIslandStone: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_BIRTH_ISLAND_STONE,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 1,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Inanimate as unknown as unknown[],
    images: build_sPicTable_BirthIslandStone(gObjectEventPic_BirthIslandStone),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Anabel(gObjectEventPic_Anabel: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Anabel(gObjectEventPic_Anabel),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Tucker(gObjectEventPic_Tucker: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Tucker(gObjectEventPic_Tucker),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Greta(gObjectEventPic_Greta: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Greta(gObjectEventPic_Greta),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Spenser(gObjectEventPic_Spenser: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_1,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_1,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Spenser(gObjectEventPic_Spenser),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Noland(gObjectEventPic_Noland: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Noland(gObjectEventPic_Noland),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Lucy(gObjectEventPic_Lucy: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_4,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_4,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Lucy(gObjectEventPic_Lucy),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Brandon(gObjectEventPic_Brandon: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_NPC_3,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_3,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Brandon(gObjectEventPic_Brandon),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RubySapphireBrendan(gObjectEventPic_RubySapphireBrendanNormal: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_RS_BRENDAN,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RubySapphireBrendan(gObjectEventPic_RubySapphireBrendanNormal),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_RubySapphireMay(gObjectEventPic_RubySapphireMayNormal: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_RS_MAY,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 256,
    width: 16,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_16x32,
    subspriteTables: sOamTables_16x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_RubySapphireMay(gObjectEventPic_RubySapphireMayNormal),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_Lugia(gObjectEventPic_Lugia: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_LUGIA,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_Standard as unknown as unknown[],
    images: build_sPicTable_Lugia(gObjectEventPic_Lugia),
    affineAnims: null,
  };
}

export function build_gObjectEventGraphicsInfo_HoOh(gObjectEventPic_HoOh: Uint8Array): ObjectEventGraphicsInfo {
  return {
    tileTag: TAG_NONE,
    paletteTag: OBJ_EVENT_PAL_TAG_HO_OH,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE,
    size: 512,
    width: 32,
    height: 32,
    paletteSlot: PALSLOT_NPC_SPECIAL,
    shadowSize: SHADOW_SIZE_M,
    inanimate: 0,
    disableReflectionPaletteLoad: 0,
    tracks: TRACKS_FOOT,
    oam: gObjectEventBaseOam_32x32,
    subspriteTables: sOamTables_32x32 as unknown as unknown[],
    anims: sAnimTable_HoOh as unknown as unknown[],
    images: build_sPicTable_HoOh(gObjectEventPic_HoOh),
    affineAnims: null,
  };
}

// ─── gObjectEventGraphicsInfoPointers 1:1 décomp pointers.h ────────────────
// Mapping graphicsId (string enum) → factory function.
// Le décomp utilise `[OBJ_EVENT_GFX_X] = &gObjectEventGraphicsInfo_Y` syntax,
// porté en TS comme un Record<string, factory>.

export type GraphicsInfoFactory = (...pics: Uint8Array[]) => ObjectEventGraphicsInfo;

export const gObjectEventGraphicsInfoPointers: Record<string, GraphicsInfoFactory> = {
  OBJ_EVENT_GFX_BRENDAN_NORMAL: build_gObjectEventGraphicsInfo_BrendanNormal as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_MACH_BIKE: build_gObjectEventGraphicsInfo_BrendanMachBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_SURFING: build_gObjectEventGraphicsInfo_BrendanSurfing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_FIELD_MOVE: build_gObjectEventGraphicsInfo_BrendanFieldMove as GraphicsInfoFactory,
  OBJ_EVENT_GFX_QUINTY_PLUMP: build_gObjectEventGraphicsInfo_QuintyPlump as GraphicsInfoFactory,
  OBJ_EVENT_GFX_NINJA_BOY: build_gObjectEventGraphicsInfo_NinjaBoy as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TWIN: build_gObjectEventGraphicsInfo_Twin as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BOY_1: build_gObjectEventGraphicsInfo_Boy1 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GIRL_1: build_gObjectEventGraphicsInfo_Girl1 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BOY_2: build_gObjectEventGraphicsInfo_Boy2 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GIRL_2: build_gObjectEventGraphicsInfo_Girl2 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LITTLE_BOY: build_gObjectEventGraphicsInfo_LittleBoy as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LITTLE_GIRL: build_gObjectEventGraphicsInfo_LittleGirl as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BOY_3: build_gObjectEventGraphicsInfo_Boy3 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GIRL_3: build_gObjectEventGraphicsInfo_Girl3 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RICH_BOY: build_gObjectEventGraphicsInfo_RichBoy as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WOMAN_1: build_gObjectEventGraphicsInfo_Woman1 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_FAT_MAN: build_gObjectEventGraphicsInfo_FatMan as GraphicsInfoFactory,
  OBJ_EVENT_GFX_POKEFAN_F: build_gObjectEventGraphicsInfo_PokefanF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAN_1: build_gObjectEventGraphicsInfo_Man1 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WOMAN_2: build_gObjectEventGraphicsInfo_Woman2 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_EXPERT_M: build_gObjectEventGraphicsInfo_ExpertM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_EXPERT_F: build_gObjectEventGraphicsInfo_ExpertF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAN_2: build_gObjectEventGraphicsInfo_Man2 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WOMAN_3: build_gObjectEventGraphicsInfo_Woman3 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_POKEFAN_M: build_gObjectEventGraphicsInfo_PokefanM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WOMAN_4: build_gObjectEventGraphicsInfo_Woman4 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_COOK: build_gObjectEventGraphicsInfo_Cook as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LINK_RECEPTIONIST: build_gObjectEventGraphicsInfo_LinkReceptionist as GraphicsInfoFactory,
  OBJ_EVENT_GFX_OLD_MAN: build_gObjectEventGraphicsInfo_OldMan as GraphicsInfoFactory,
  OBJ_EVENT_GFX_OLD_WOMAN: build_gObjectEventGraphicsInfo_OldWoman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CAMPER: build_gObjectEventGraphicsInfo_Camper as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PICNICKER: build_gObjectEventGraphicsInfo_Picnicker as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAN_3: build_gObjectEventGraphicsInfo_Man3 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WOMAN_5: build_gObjectEventGraphicsInfo_Woman5 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_YOUNGSTER: build_gObjectEventGraphicsInfo_Youngster as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BUG_CATCHER: build_gObjectEventGraphicsInfo_BugCatcher as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PSYCHIC_M: build_gObjectEventGraphicsInfo_PsychicM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SCHOOL_KID_M: build_gObjectEventGraphicsInfo_SchoolKidM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MANIAC: build_gObjectEventGraphicsInfo_Maniac as GraphicsInfoFactory,
  OBJ_EVENT_GFX_HEX_MANIAC: build_gObjectEventGraphicsInfo_HexManiac as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RAYQUAZA_STILL: build_gObjectEventGraphicsInfo_RayquazaStill as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SWIMMER_M: build_gObjectEventGraphicsInfo_SwimmerM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SWIMMER_F: build_gObjectEventGraphicsInfo_SwimmerF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BLACK_BELT: build_gObjectEventGraphicsInfo_BlackBelt as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BEAUTY: build_gObjectEventGraphicsInfo_Beauty as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SCIENTIST_1: build_gObjectEventGraphicsInfo_Scientist1 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LASS: build_gObjectEventGraphicsInfo_Lass as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GENTLEMAN: build_gObjectEventGraphicsInfo_Gentleman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SAILOR: build_gObjectEventGraphicsInfo_Sailor as GraphicsInfoFactory,
  OBJ_EVENT_GFX_FISHERMAN: build_gObjectEventGraphicsInfo_Fisherman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RUNNING_TRIATHLETE_M: build_gObjectEventGraphicsInfo_RunningTriathleteM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F: build_gObjectEventGraphicsInfo_RunningTriathleteF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TUBER_F: build_gObjectEventGraphicsInfo_TuberF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TUBER_M: build_gObjectEventGraphicsInfo_TuberM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_HIKER: build_gObjectEventGraphicsInfo_Hiker as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M: build_gObjectEventGraphicsInfo_CyclingTriathleteM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CYCLING_TRIATHLETE_F: build_gObjectEventGraphicsInfo_CyclingTriathleteF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_NURSE: build_gObjectEventGraphicsInfo_Nurse as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ITEM_BALL: build_gObjectEventGraphicsInfo_ItemBall as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BERRY_TREE: build_gObjectEventGraphicsInfo_BerryTree as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BERRY_TREE_EARLY_STAGES: build_gObjectEventGraphicsInfo_BerryTreeEarlyStages as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BERRY_TREE_LATE_STAGES: build_gObjectEventGraphicsInfo_BerryTreeLateStages as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_ACRO_BIKE: build_gObjectEventGraphicsInfo_BrendanAcroBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PROF_BIRCH: build_gObjectEventGraphicsInfo_ProfBirch as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAN_4: build_gObjectEventGraphicsInfo_Man4 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAN_5: build_gObjectEventGraphicsInfo_Man5 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_REPORTER_M: build_gObjectEventGraphicsInfo_ReporterM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_REPORTER_F: build_gObjectEventGraphicsInfo_ReporterF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BARD: build_gObjectEventGraphicsInfo_Bard as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ANABEL: build_gObjectEventGraphicsInfo_Anabel as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TUCKER: build_gObjectEventGraphicsInfo_Tucker as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GRETA: build_gObjectEventGraphicsInfo_Greta as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SPENSER: build_gObjectEventGraphicsInfo_Spenser as GraphicsInfoFactory,
  OBJ_EVENT_GFX_NOLAND: build_gObjectEventGraphicsInfo_Noland as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LUCY: build_gObjectEventGraphicsInfo_Lucy as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_NATU_DOLL: build_gObjectEventGraphicsInfo_UnusedNatuDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_MAGNEMITE_DOLL: build_gObjectEventGraphicsInfo_UnusedMagnemiteDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_SQUIRTLE_DOLL: build_gObjectEventGraphicsInfo_UnusedSquirtleDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_WOOPER_DOLL: build_gObjectEventGraphicsInfo_UnusedWooperDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_PIKACHU_DOLL: build_gObjectEventGraphicsInfo_UnusedPikachuDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNUSED_PORYGON2_DOLL: build_gObjectEventGraphicsInfo_UnusedPorygon2Doll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CUTTABLE_TREE: build_gObjectEventGraphicsInfo_CuttableTree as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MART_EMPLOYEE: build_gObjectEventGraphicsInfo_MartEmployee as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ROOFTOP_SALE_WOMAN: build_gObjectEventGraphicsInfo_RooftopSaleWoman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TEALA: build_gObjectEventGraphicsInfo_Teala as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BREAKABLE_ROCK: build_gObjectEventGraphicsInfo_BreakableRock as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PUSHABLE_BOULDER: build_gObjectEventGraphicsInfo_PushableBoulder as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MR_BRINEYS_BOAT: build_gObjectEventGraphicsInfo_MrBrineysBoat as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_NORMAL: build_gObjectEventGraphicsInfo_MayNormal as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_MACH_BIKE: build_gObjectEventGraphicsInfo_MayMachBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_ACRO_BIKE: build_gObjectEventGraphicsInfo_MayAcroBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_SURFING: build_gObjectEventGraphicsInfo_MaySurfing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_FIELD_MOVE: build_gObjectEventGraphicsInfo_MayFieldMove as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TRUCK: build_gObjectEventGraphicsInfo_Truck as GraphicsInfoFactory,
  OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX: build_gObjectEventGraphicsInfo_VigorothCarryingBox as GraphicsInfoFactory,
  OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY: build_gObjectEventGraphicsInfo_VigorothFacingAway as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIRCHS_BAG: build_gObjectEventGraphicsInfo_BirchsBag as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ZIGZAGOON_1: build_gObjectEventGraphicsInfo_EnemyZigzagoon as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ARTIST: build_gObjectEventGraphicsInfo_Artist as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL: build_gObjectEventGraphicsInfo_RivalBrendanNormal as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_BRENDAN_MACH_BIKE: build_gObjectEventGraphicsInfo_RivalBrendanMachBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_BRENDAN_ACRO_BIKE: build_gObjectEventGraphicsInfo_RivalBrendanAcroBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_BRENDAN_SURFING: build_gObjectEventGraphicsInfo_RivalBrendanSurfing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_BRENDAN_FIELD_MOVE: build_gObjectEventGraphicsInfo_RivalBrendanFieldMove as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_MAY_NORMAL: build_gObjectEventGraphicsInfo_RivalMayNormal as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_MAY_MACH_BIKE: build_gObjectEventGraphicsInfo_RivalMayMachBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_MAY_ACRO_BIKE: build_gObjectEventGraphicsInfo_RivalMayAcroBike as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_MAY_SURFING: build_gObjectEventGraphicsInfo_RivalMaySurfing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RIVAL_MAY_FIELD_MOVE: build_gObjectEventGraphicsInfo_RivalMayFieldMove as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CAMERAMAN: build_gObjectEventGraphicsInfo_Cameraman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_UNDERWATER: build_gObjectEventGraphicsInfo_BrendanUnderwater as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_UNDERWATER: build_gObjectEventGraphicsInfo_MayUnderwater as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MOVING_BOX: build_gObjectEventGraphicsInfo_MovingBox as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CABLE_CAR: build_gObjectEventGraphicsInfo_CableCar as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SCIENTIST_2: build_gObjectEventGraphicsInfo_Scientist2 as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DEVON_EMPLOYEE: build_gObjectEventGraphicsInfo_DevonEmployee as GraphicsInfoFactory,
  OBJ_EVENT_GFX_AQUA_MEMBER_M: build_gObjectEventGraphicsInfo_AquaMemberM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_AQUA_MEMBER_F: build_gObjectEventGraphicsInfo_AquaMemberF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAGMA_MEMBER_M: build_gObjectEventGraphicsInfo_MagmaMemberM as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAGMA_MEMBER_F: build_gObjectEventGraphicsInfo_MagmaMemberF as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SIDNEY: build_gObjectEventGraphicsInfo_Sidney as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PHOEBE: build_gObjectEventGraphicsInfo_Phoebe as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GLACIA: build_gObjectEventGraphicsInfo_Glacia as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DRAKE: build_gObjectEventGraphicsInfo_Drake as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ROXANNE: build_gObjectEventGraphicsInfo_Roxanne as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRAWLY: build_gObjectEventGraphicsInfo_Brawly as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WATTSON: build_gObjectEventGraphicsInfo_Wattson as GraphicsInfoFactory,
  OBJ_EVENT_GFX_FLANNERY: build_gObjectEventGraphicsInfo_Flannery as GraphicsInfoFactory,
  OBJ_EVENT_GFX_NORMAN: build_gObjectEventGraphicsInfo_Norman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WINONA: build_gObjectEventGraphicsInfo_Winona as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LIZA: build_gObjectEventGraphicsInfo_Liza as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TATE: build_gObjectEventGraphicsInfo_Tate as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WALLACE: build_gObjectEventGraphicsInfo_Wallace as GraphicsInfoFactory,
  OBJ_EVENT_GFX_STEVEN: build_gObjectEventGraphicsInfo_Steven as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WALLY: build_gObjectEventGraphicsInfo_Wally as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LITTLE_BOY_3: build_gObjectEventGraphicsInfo_RubySapphireLittleBoy as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_FISHING: build_gObjectEventGraphicsInfo_BrendanFishing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_FISHING: build_gObjectEventGraphicsInfo_MayFishing as GraphicsInfoFactory,
  OBJ_EVENT_GFX_HOT_SPRINGS_OLD_WOMAN: build_gObjectEventGraphicsInfo_HotSpringsOldWoman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SS_TIDAL: build_gObjectEventGraphicsInfo_SSTidal as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SUBMARINE_SHADOW: build_gObjectEventGraphicsInfo_SubmarineShadow as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PICHU_DOLL: build_gObjectEventGraphicsInfo_PichuDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PIKACHU_DOLL: build_gObjectEventGraphicsInfo_PikachuDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MARILL_DOLL: build_gObjectEventGraphicsInfo_MarillDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TOGEPI_DOLL: build_gObjectEventGraphicsInfo_TogepiDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CYNDAQUIL_DOLL: build_gObjectEventGraphicsInfo_CyndaquilDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CHIKORITA_DOLL: build_gObjectEventGraphicsInfo_ChikoritaDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TOTODILE_DOLL: build_gObjectEventGraphicsInfo_TotodileDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_JIGGLYPUFF_DOLL: build_gObjectEventGraphicsInfo_JigglypuffDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MEOWTH_DOLL: build_gObjectEventGraphicsInfo_MeowthDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CLEFAIRY_DOLL: build_gObjectEventGraphicsInfo_ClefairyDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DITTO_DOLL: build_gObjectEventGraphicsInfo_DittoDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SMOOCHUM_DOLL: build_gObjectEventGraphicsInfo_SmoochumDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TREECKO_DOLL: build_gObjectEventGraphicsInfo_TreeckoDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TORCHIC_DOLL: build_gObjectEventGraphicsInfo_TorchicDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MUDKIP_DOLL: build_gObjectEventGraphicsInfo_MudkipDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DUSKULL_DOLL: build_gObjectEventGraphicsInfo_DuskullDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WYNAUT_DOLL: build_gObjectEventGraphicsInfo_WynautDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BALTOY_DOLL: build_gObjectEventGraphicsInfo_BaltoyDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KECLEON_DOLL: build_gObjectEventGraphicsInfo_KecleonDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_AZURILL_DOLL: build_gObjectEventGraphicsInfo_AzurillDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SKITTY_DOLL: build_gObjectEventGraphicsInfo_SkittyDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SWABLU_DOLL: build_gObjectEventGraphicsInfo_SwabluDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GULPIN_DOLL: build_gObjectEventGraphicsInfo_GulpinDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LOTAD_DOLL: build_gObjectEventGraphicsInfo_LotadDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SEEDOT_DOLL: build_gObjectEventGraphicsInfo_SeedotDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PIKA_CUSHION: build_gObjectEventGraphicsInfo_PikaCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ROUND_CUSHION: build_gObjectEventGraphicsInfo_RoundCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KISS_CUSHION: build_gObjectEventGraphicsInfo_KissCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ZIGZAG_CUSHION: build_gObjectEventGraphicsInfo_ZigzagCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SPIN_CUSHION: build_gObjectEventGraphicsInfo_SpinCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DIAMOND_CUSHION: build_gObjectEventGraphicsInfo_DiamondCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BALL_CUSHION: build_gObjectEventGraphicsInfo_BallCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GRASS_CUSHION: build_gObjectEventGraphicsInfo_GrassCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_FIRE_CUSHION: build_gObjectEventGraphicsInfo_FireCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WATER_CUSHION: build_gObjectEventGraphicsInfo_WaterCushion as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_SNORLAX_DOLL: build_gObjectEventGraphicsInfo_BigSnorlaxDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_RHYDON_DOLL: build_gObjectEventGraphicsInfo_BigRhydonDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_LAPRAS_DOLL: build_gObjectEventGraphicsInfo_BigLaprasDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_VENUSAUR_DOLL: build_gObjectEventGraphicsInfo_BigVenusaurDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_CHARIZARD_DOLL: build_gObjectEventGraphicsInfo_BigCharizardDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_BLASTOISE_DOLL: build_gObjectEventGraphicsInfo_BigBlastoiseDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_WAILMER_DOLL: build_gObjectEventGraphicsInfo_BigWailmerDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_REGIROCK_DOLL: build_gObjectEventGraphicsInfo_BigRegirockDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_REGICE_DOLL: build_gObjectEventGraphicsInfo_BigRegiceDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BIG_REGISTEEL_DOLL: build_gObjectEventGraphicsInfo_BigRegisteelDoll as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LATIAS: build_gObjectEventGraphicsInfo_Latias as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LATIOS: build_gObjectEventGraphicsInfo_Latios as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GAMEBOY_KID: build_gObjectEventGraphicsInfo_GameboyKid as GraphicsInfoFactory,
  OBJ_EVENT_GFX_CONTEST_JUDGE: build_gObjectEventGraphicsInfo_ContestJudge as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_WATERING: build_gObjectEventGraphicsInfo_BrendanWatering as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_WATERING: build_gObjectEventGraphicsInfo_MayWatering as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRENDAN_DECORATING: build_gObjectEventGraphicsInfo_BrendanDecorating as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAY_DECORATING: build_gObjectEventGraphicsInfo_MayDecorating as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ARCHIE: build_gObjectEventGraphicsInfo_Archie as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MAXIE: build_gObjectEventGraphicsInfo_Maxie as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KYOGRE_FRONT: build_gObjectEventGraphicsInfo_KyogreFront as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GROUDON_FRONT: build_gObjectEventGraphicsInfo_GroudonFront as GraphicsInfoFactory,
  OBJ_EVENT_GFX_FOSSIL: build_gObjectEventGraphicsInfo_Fossil as GraphicsInfoFactory,
  OBJ_EVENT_GFX_REGIROCK: build_gObjectEventGraphicsInfo_Regirock as GraphicsInfoFactory,
  OBJ_EVENT_GFX_REGICE: build_gObjectEventGraphicsInfo_Regice as GraphicsInfoFactory,
  OBJ_EVENT_GFX_REGISTEEL: build_gObjectEventGraphicsInfo_Registeel as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SKITTY: build_gObjectEventGraphicsInfo_Skitty as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KECLEON: build_gObjectEventGraphicsInfo_Kecleon as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KYOGRE_ASLEEP: build_gObjectEventGraphicsInfo_KyogreAsleep as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GROUDON_ASLEEP: build_gObjectEventGraphicsInfo_GroudonAsleep as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RAYQUAZA: build_gObjectEventGraphicsInfo_Rayquaza as GraphicsInfoFactory,
  OBJ_EVENT_GFX_ZIGZAGOON_2: build_gObjectEventGraphicsInfo_Zigzagoon as GraphicsInfoFactory,
  OBJ_EVENT_GFX_PIKACHU: build_gObjectEventGraphicsInfo_Pikachu as GraphicsInfoFactory,
  OBJ_EVENT_GFX_AZUMARILL: build_gObjectEventGraphicsInfo_Azumarill as GraphicsInfoFactory,
  OBJ_EVENT_GFX_WINGULL: build_gObjectEventGraphicsInfo_Wingull as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KECLEON_BRIDGE_SHADOW: build_gObjectEventGraphicsInfo_KecleonBridgeShadow as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TUBER_M_SWIMMING: build_gObjectEventGraphicsInfo_TuberMSwimming as GraphicsInfoFactory,
  OBJ_EVENT_GFX_AZURILL: build_gObjectEventGraphicsInfo_Azurill as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MOM: build_gObjectEventGraphicsInfo_Mom as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LINK_BRENDAN: build_gObjectEventGraphicsInfo_LinkBrendan as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LINK_MAY: build_gObjectEventGraphicsInfo_LinkMay as GraphicsInfoFactory,
  OBJ_EVENT_GFX_JUAN: build_gObjectEventGraphicsInfo_Juan as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SCOTT: build_gObjectEventGraphicsInfo_Scott as GraphicsInfoFactory,
  OBJ_EVENT_GFX_POOCHYENA: build_gObjectEventGraphicsInfo_Poochyena as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KYOGRE_SIDE: build_gObjectEventGraphicsInfo_KyogreSide as GraphicsInfoFactory,
  OBJ_EVENT_GFX_GROUDON_SIDE: build_gObjectEventGraphicsInfo_GroudonSide as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MYSTERY_GIFT_MAN: build_gObjectEventGraphicsInfo_MysteryEventDeliveryman as GraphicsInfoFactory,
  OBJ_EVENT_GFX_TRICK_HOUSE_STATUE: build_gObjectEventGraphicsInfo_Statue as GraphicsInfoFactory,
  OBJ_EVENT_GFX_KIRLIA: build_gObjectEventGraphicsInfo_Kirlia as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DUSCLOPS: build_gObjectEventGraphicsInfo_Dusclops as GraphicsInfoFactory,
  OBJ_EVENT_GFX_UNION_ROOM_NURSE: build_gObjectEventGraphicsInfo_UnionRoomAttendant as GraphicsInfoFactory,
  OBJ_EVENT_GFX_SUDOWOODO: build_gObjectEventGraphicsInfo_Sudowoodo as GraphicsInfoFactory,
  OBJ_EVENT_GFX_MEW: build_gObjectEventGraphicsInfo_Mew as GraphicsInfoFactory,
  OBJ_EVENT_GFX_RED: build_gObjectEventGraphicsInfo_Red as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LEAF: build_gObjectEventGraphicsInfo_Leaf as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DEOXYS: build_gObjectEventGraphicsInfo_Deoxys as GraphicsInfoFactory,
  OBJ_EVENT_GFX_DEOXYS_TRIANGLE: build_gObjectEventGraphicsInfo_BirthIslandStone as GraphicsInfoFactory,
  OBJ_EVENT_GFX_BRANDON: build_gObjectEventGraphicsInfo_Brandon as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LINK_RS_BRENDAN: build_gObjectEventGraphicsInfo_RubySapphireBrendan as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LINK_RS_MAY: build_gObjectEventGraphicsInfo_RubySapphireMay as GraphicsInfoFactory,
  OBJ_EVENT_GFX_LUGIA: build_gObjectEventGraphicsInfo_Lugia as GraphicsInfoFactory,
  OBJ_EVENT_GFX_HOOH: build_gObjectEventGraphicsInfo_HoOh as GraphicsInfoFactory,
};

/** 1:1 décomp `gMauvilleOldManGraphicsInfoPointers` (pointers.h:491-499). */
export const gMauvilleOldManGraphicsInfoPointers: Record<string, GraphicsInfoFactory> = {
  MAUVILLE_MAN_BARD: build_gObjectEventGraphicsInfo_Bard as GraphicsInfoFactory,
  MAUVILLE_MAN_HIPSTER: build_gObjectEventGraphicsInfo_Hipster as GraphicsInfoFactory,
  MAUVILLE_MAN_TRADER: build_gObjectEventGraphicsInfo_Trader as GraphicsInfoFactory,
  MAUVILLE_MAN_STORYTELLER: build_gObjectEventGraphicsInfo_Storyteller as GraphicsInfoFactory,
  MAUVILLE_MAN_GIDDY: build_gObjectEventGraphicsInfo_Giddy as GraphicsInfoFactory,
  MAUVILLE_MAN_UNUSED1: build_gObjectEventGraphicsInfo_UnusedMauvilleOldMan1 as GraphicsInfoFactory,
  MAUVILLE_MAN_UNUSED2: build_gObjectEventGraphicsInfo_UnusedMauvilleOldMan2 as GraphicsInfoFactory,
};

// ─── GetObjectEventGraphicsInfo 1:1 décomp event_object_movement.c:1538-1541 ─
/**
 *  1:1 décomp `GetObjectEventGraphicsInfo` (event_object_movement.c:1538-1541) :
 *    const struct ObjectEventGraphicsInfo *GetObjectEventGraphicsInfo(u16 graphicsId)
 *    {
 *        if (graphicsId >= OBJ_EVENT_GFX_VARS)
 *            graphicsId = VarGetObjectEventGraphicsId(graphicsId - OBJ_EVENT_GFX_VARS);
 *        if (graphicsId >= NUM_OBJ_EVENT_GFX)
 *            graphicsId = OBJ_EVENT_GFX_NINJA_BOY;
 *        return gObjectEventGraphicsInfoPointers[graphicsId];
 *    }
 *
 *  Notre port prend des string enum (= graphicsId TS), pas de u16 numeric.
 *  Les caller passe les pics via un dispatch externe (les pics sont chargés
 *  async PNG → loadTileBin → Uint8Array).
 */
export function GetObjectEventGraphicsInfo(
  graphicsId: string,
  ...pics: Uint8Array[]
): ObjectEventGraphicsInfo | null {
  const factory = gObjectEventGraphicsInfoPointers[graphicsId];
  if (!factory) return null;
  return factory(...pics);
}
