/**
 * object_event_graphics_info.ts — Port 1:1 STRICT decomp.
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info.h
 * Les 245 build_gObjectEventGraphicsInfo_* factories. Chacune appelle
 * son build_sPicTable_* (importe de object_event_pic_tables.ts).
 */
import type { ObjectEventGraphicsInfo, SpriteFrameImage } from '../../engine/field/object-event-graphics-info';
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
} from '../../engine/field/object-event-graphics-info';
import {
  gObjectEventBaseOam_16x16,
  gObjectEventBaseOam_16x32,
  gObjectEventBaseOam_32x32,
  gObjectEventBaseOam_64x64,
  gObjectEventBaseOam_8x8,
} from '../../engine/field/object-event-base-oam';
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
import {
  build_sPicTable_Anabel,
  build_sPicTable_AquaMemberF,
  build_sPicTable_AquaMemberM,
  build_sPicTable_Archie,
  build_sPicTable_Artist,
  build_sPicTable_Azumarill,
  build_sPicTable_Azurill,
  build_sPicTable_AzurillDoll,
  build_sPicTable_BallCushion,
  build_sPicTable_BaltoyDoll,
  build_sPicTable_Beauty,
  build_sPicTable_BigBlastoiseDoll,
  build_sPicTable_BigCharizardDoll,
  build_sPicTable_BigLaprasDoll,
  build_sPicTable_BigRegiceDoll,
  build_sPicTable_BigRegirockDoll,
  build_sPicTable_BigRegisteelDoll,
  build_sPicTable_BigRhydonDoll,
  build_sPicTable_BigSnorlaxDoll,
  build_sPicTable_BigVenusaurDoll,
  build_sPicTable_BigWailmerDoll,
  build_sPicTable_BirchsBag,
  build_sPicTable_BirthIslandStone,
  build_sPicTable_BlackBelt,
  build_sPicTable_Boy1,
  build_sPicTable_Boy2,
  build_sPicTable_Boy3,
  build_sPicTable_Brandon,
  build_sPicTable_Brawly,
  build_sPicTable_BreakableRock,
  build_sPicTable_BrendanAcroBike,
  build_sPicTable_BrendanDecorating,
  build_sPicTable_BrendanFieldMove,
  build_sPicTable_BrendanFishing,
  build_sPicTable_BrendanMachBike,
  build_sPicTable_BrendanNormal,
  build_sPicTable_BrendanSurfing,
  build_sPicTable_BrendanUnderwater,
  build_sPicTable_BrendanWatering,
  build_sPicTable_BugCatcher,
  build_sPicTable_CableCar,
  build_sPicTable_Cameraman,
  build_sPicTable_Camper,
  build_sPicTable_ChikoritaDoll,
  build_sPicTable_ClefairyDoll,
  build_sPicTable_ContestJudge,
  build_sPicTable_Cook,
  build_sPicTable_CuttableTree,
  build_sPicTable_CyclingTriathleteF,
  build_sPicTable_CyclingTriathleteM,
  build_sPicTable_CyndaquilDoll,
  build_sPicTable_Deoxys,
  build_sPicTable_DevonEmployee,
  build_sPicTable_DiamondCushion,
  build_sPicTable_DittoDoll,
  build_sPicTable_Drake,
  build_sPicTable_Dusclops,
  build_sPicTable_DuskullDoll,
  build_sPicTable_EnemyZigzagoon,
  build_sPicTable_ExpertF,
  build_sPicTable_ExpertM,
  build_sPicTable_FatMan,
  build_sPicTable_FireCushion,
  build_sPicTable_Fisherman,
  build_sPicTable_Flannery,
  build_sPicTable_Fossil,
  build_sPicTable_GameboyKid,
  build_sPicTable_Gentleman,
  build_sPicTable_Girl1,
  build_sPicTable_Girl2,
  build_sPicTable_Girl3,
  build_sPicTable_Glacia,
  build_sPicTable_GrassCushion,
  build_sPicTable_Greta,
  build_sPicTable_GroudonFront,
  build_sPicTable_GroudonSide,
  build_sPicTable_GulpinDoll,
  build_sPicTable_HexManiac,
  build_sPicTable_Hiker,
  build_sPicTable_HoOh,
  build_sPicTable_HotSpringsOldWoman,
  build_sPicTable_ItemBall,
  build_sPicTable_JigglypuffDoll,
  build_sPicTable_Juan,
  build_sPicTable_Kecleon,
  build_sPicTable_KecleonDoll,
  build_sPicTable_Kirlia,
  build_sPicTable_KissCushion,
  build_sPicTable_KyogreFront,
  build_sPicTable_KyogreSide,
  build_sPicTable_Lass,
  build_sPicTable_LatiasLatios,
  build_sPicTable_Leaf,
  build_sPicTable_LinkReceptionist,
  build_sPicTable_LittleBoy,
  build_sPicTable_LittleGirl,
  build_sPicTable_Liza,
  build_sPicTable_LotadDoll,
  build_sPicTable_Lucy,
  build_sPicTable_Lugia,
  build_sPicTable_MagmaMemberF,
  build_sPicTable_MagmaMemberM,
  build_sPicTable_Man1,
  build_sPicTable_Man2,
  build_sPicTable_Man3,
  build_sPicTable_Man4,
  build_sPicTable_Man5,
  build_sPicTable_Maniac,
  build_sPicTable_MarillDoll,
  build_sPicTable_MartEmployee,
  build_sPicTable_MauvilleOldMan1,
  build_sPicTable_MauvilleOldMan2,
  build_sPicTable_Maxie,
  build_sPicTable_MayAcroBike,
  build_sPicTable_MayDecorating,
  build_sPicTable_MayFieldMove,
  build_sPicTable_MayFishing,
  build_sPicTable_MayMachBike,
  build_sPicTable_MayNormal,
  build_sPicTable_MaySurfing,
  build_sPicTable_MayUnderwater,
  build_sPicTable_MayWatering,
  build_sPicTable_MeowthDoll,
  build_sPicTable_Mew,
  build_sPicTable_Mom,
  build_sPicTable_MovingBox,
  build_sPicTable_MrBrineysBoat,
  build_sPicTable_MudkipDoll,
  build_sPicTable_MysteryEventDeliveryman,
  build_sPicTable_NinjaBoy,
  build_sPicTable_Noland,
  build_sPicTable_Norman,
  build_sPicTable_Nurse,
  build_sPicTable_OldMan,
  build_sPicTable_OldWoman,
  build_sPicTable_PechaBerryTree,
  build_sPicTable_Phoebe,
  build_sPicTable_PichuDoll,
  build_sPicTable_Picnicker,
  build_sPicTable_PikaCushion,
  build_sPicTable_Pikachu,
  build_sPicTable_PikachuDoll,
  build_sPicTable_PokefanF,
  build_sPicTable_PokefanM,
  build_sPicTable_Poochyena,
  build_sPicTable_ProfBirch,
  build_sPicTable_PsychicM,
  build_sPicTable_PushableBoulder,
  build_sPicTable_QuintyPlump,
  build_sPicTable_Rayquaza,
  build_sPicTable_RayquazaStill,
  build_sPicTable_Red,
  build_sPicTable_Regi,
  build_sPicTable_ReporterF,
  build_sPicTable_ReporterM,
  build_sPicTable_RichBoy,
  build_sPicTable_RooftopSaleWoman,
  build_sPicTable_RoundCushion,
  build_sPicTable_Roxanne,
  build_sPicTable_RubySapphireBrendan,
  build_sPicTable_RubySapphireLittleBoy,
  build_sPicTable_RubySapphireMay,
  build_sPicTable_RunningTriathleteF,
  build_sPicTable_RunningTriathleteM,
  build_sPicTable_SSTidal,
  build_sPicTable_Sailor,
  build_sPicTable_SchoolKidM,
  build_sPicTable_Scientist1,
  build_sPicTable_Scientist2,
  build_sPicTable_Scott,
  build_sPicTable_SeedotDoll,
  build_sPicTable_Sidney,
  build_sPicTable_Skitty,
  build_sPicTable_SkittyDoll,
  build_sPicTable_SmoochumDoll,
  build_sPicTable_Spenser,
  build_sPicTable_SpinCushion,
  build_sPicTable_Statue,
  build_sPicTable_Steven,
  build_sPicTable_SubmarineShadow,
  build_sPicTable_Sudowoodo,
  build_sPicTable_SwabluDoll,
  build_sPicTable_SwimmerF,
  build_sPicTable_SwimmerM,
  build_sPicTable_Tate,
  build_sPicTable_Teala,
  build_sPicTable_TogepiDoll,
  build_sPicTable_TorchicDoll,
  build_sPicTable_TotodileDoll,
  build_sPicTable_TreeckoDoll,
  build_sPicTable_Truck,
  build_sPicTable_TuberF,
  build_sPicTable_TuberM,
  build_sPicTable_TuberMSwimming,
  build_sPicTable_Tucker,
  build_sPicTable_Twin,
  build_sPicTable_UnionRoomAttendant,
  build_sPicTable_UnusedMagnemiteDoll,
  build_sPicTable_UnusedNatuDoll,
  build_sPicTable_UnusedPikachuDoll,
  build_sPicTable_UnusedPorygon2Doll,
  build_sPicTable_UnusedSquirtleDoll,
  build_sPicTable_UnusedWooperDoll,
  build_sPicTable_VigorothCarryingBox,
  build_sPicTable_VigorothFacingAway,
  build_sPicTable_Wallace,
  build_sPicTable_Wally,
  build_sPicTable_WaterCushion,
  build_sPicTable_Wattson,
  build_sPicTable_Wingull,
  build_sPicTable_Winona,
  build_sPicTable_Woman1,
  build_sPicTable_Woman2,
  build_sPicTable_Woman3,
  build_sPicTable_Woman4,
  build_sPicTable_Woman5,
  build_sPicTable_WynautDoll,
  build_sPicTable_Youngster,
  build_sPicTable_ZigzagCushion,
  build_sPicTable_Zigzagoon,
} from './object_event_pic_tables';

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
