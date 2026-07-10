/**
 * object_event_pic_tables.ts — Port 1:1 STRICT decomp.
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h
 * Les 249 sPicTable builders (= pic table de chaque graphicsInfo).
 * Genere : ne JAMAIS diverger ; modifier le decomp source puis re-generer.
 */
import type { ObjectEventGraphicsInfo } from '../../../include/global.fieldmap';
import type { SpriteFrameImage } from '../../../include/sprite';
import { overworld_frame, TAG_NONE } from '../../../include/sprite';
import {
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
} from '../../../include/event_object_movement';
import {
  SHADOW_SIZE_S,
  SHADOW_SIZE_M,
  SHADOW_SIZE_L,
  SHADOW_SIZE_XL,
  TRACKS_NONE,
  TRACKS_FOOT,
  TRACKS_BIKE_TIRE,
  TRACKS_SLITHER,
} from '../../../include/constants/event_object_movement';
import {
  gObjectEventBaseOam_16x16,
  gObjectEventBaseOam_16x32,
  gObjectEventBaseOam_32x32,
  gObjectEventBaseOam_64x64,
  gObjectEventBaseOam_8x8,
} from './base_oam';
import {
  sAnimTable_Standard, sAnimTable_Inanimate, sAnimTable_QuintyPlump,
  sAnimTable_BrendanMayNormal, sAnimTable_AcroBike, sAnimTable_Surfing,
  sAnimTable_Nurse, sAnimTable_FieldMove, sAnimTable_BerryTree,
  sAnimTable_BreakableRock, sAnimTable_CuttableTree, sAnimTable_Fishing,
  sAnimTable_HoOh, sAnimTable_Rayquaza, sAnimTable_GroudonSide,
} from './object_event_anims';
import {
  sOamTables_16x16, sOamTables_16x32, sOamTables_32x32, sOamTables_48x48,
  sOamTables_64x32, sOamTables_64x64, sOamTables_96x40, sOamTables_88x32,
} from './object_event_subsprites';

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
