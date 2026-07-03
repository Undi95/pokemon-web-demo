/**
 * landmark.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/landmark.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/landmark.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { FLAG_LANDMARK_ABANDONED_SHIP, FLAG_LANDMARK_ALTERING_CAVE, FLAG_LANDMARK_ANCIENT_TOMB, FLAG_LANDMARK_BERRY_MASTERS_HOUSE, FLAG_LANDMARK_DESERT_RUINS, FLAG_LANDMARK_DESERT_UNDERPASS, FLAG_LANDMARK_FIERY_PATH, FLAG_LANDMARK_FLOWER_SHOP, FLAG_LANDMARK_FOSSIL_MANIACS_HOUSE, FLAG_LANDMARK_GLASS_WORKSHOP, FLAG_LANDMARK_HUNTERS_HOUSE, FLAG_LANDMARK_ISLAND_CAVE, FLAG_LANDMARK_LANETTES_HOUSE, FLAG_LANDMARK_MIRAGE_TOWER, FLAG_LANDMARK_MR_BRINEY_HOUSE, FLAG_LANDMARK_NEW_MAUVILLE, FLAG_LANDMARK_OLD_LADY_REST_SHOP, FLAG_LANDMARK_POKEMON_DAYCARE, FLAG_LANDMARK_SCORCHED_SLAB, FLAG_LANDMARK_SEAFLOOR_CAVERN, FLAG_LANDMARK_SEALED_CHAMBER, FLAG_LANDMARK_SEASHORE_HOUSE, FLAG_LANDMARK_SKY_PILLAR, FLAG_LANDMARK_TRAINER_HILL, FLAG_LANDMARK_TRICK_HOUSE, FLAG_LANDMARK_TUNNELERS_REST_HOUSE, FLAG_LANDMARK_WINSTRATE_FAMILY } from '../include/constants/flags';
import { MAPSEC_MT_CHIMNEY, MAPSEC_NONE, MAPSEC_ROUTE_103, MAPSEC_ROUTE_104, MAPSEC_ROUTE_105, MAPSEC_ROUTE_106, MAPSEC_ROUTE_108, MAPSEC_ROUTE_109, MAPSEC_ROUTE_110, MAPSEC_ROUTE_111, MAPSEC_ROUTE_112, MAPSEC_ROUTE_113, MAPSEC_ROUTE_114, MAPSEC_ROUTE_115, MAPSEC_ROUTE_116, MAPSEC_ROUTE_117, MAPSEC_ROUTE_119, MAPSEC_ROUTE_120, MAPSEC_ROUTE_121, MAPSEC_ROUTE_122, MAPSEC_ROUTE_123, MAPSEC_ROUTE_124, MAPSEC_ROUTE_125, MAPSEC_ROUTE_128, MAPSEC_ROUTE_131, MAPSEC_ROUTE_132, MAPSEC_ROUTE_133, MAPSEC_ROUTE_134 } from '../include/constants/region_map_sections';
import { FlagGet } from './event_data';
import { encodeOwText } from './text';

/** 1:1 `struct Landmark` (landmark.c:5). */
interface Landmark {
  name: Uint8Array;
  flag: number;
}

/** 1:1 `struct LandmarkList` (landmark.c:11). */
interface LandmarkList {
  mapSection: number;
  id: number;
  landmarks: any;
}

/** 1:1 (landmark.c:18) */
const LandmarkName_FlowerShop = encodeOwText("FLEURISTE");

/** 1:1 (landmark.c:19) */
const LandmarkName_PetalburgWoods = encodeOwText("BOIS CLEMENTI");

/** 1:1 (landmark.c:20) */
const LandmarkName_MrBrineysCottage = encodeOwText("COTTAGE DE M. MARCO");

/** 1:1 (landmark.c:21) */
const LandmarkName_AbandonedShip = encodeOwText("EPAVE");

/** 1:1 (landmark.c:22) */
const LandmarkName_SeashoreHouse = encodeOwText("MAISON DU BORD DE MER");

/** 1:1 (landmark.c:23) */
const LandmarkName_SlateportBeach = encodeOwText("PLAGE POIVRESSEL");

/** 1:1 (landmark.c:24) */
const LandmarkName_CyclingRoad = encodeOwText("PISTE CYCLABLE");

/** 1:1 (landmark.c:25) */
const LandmarkName_NewMauville = encodeOwText("NEW LAVANDIA");

/** 1:1 (landmark.c:26) */
const LandmarkName_TrickHouse = encodeOwText("MAISON DES PIEGES");

/** 1:1 (landmark.c:27) */
const LandmarkName_OldLadysRestShop = encodeOwText("GITE VIEILLE DAME");

/** 1:1 (landmark.c:28) */
const LandmarkName_Desert = encodeOwText("DESERT");

/** 1:1 (landmark.c:29) */
const LandmarkName_WinstrateFamily = encodeOwText("FAMILLE STRATEGE");

/** 1:1 (landmark.c:30) */
const LandmarkName_CableCar = encodeOwText("TELEPHERIQUE");

/** 1:1 (landmark.c:31) */
const LandmarkName_GlassWorkshop = encodeOwText("ATELIER DU VERRE");

/** 1:1 (landmark.c:32) */
const LandmarkName_WeatherInstitute = encodeOwText("CENTRE METEO");

/** 1:1 (landmark.c:33) */
const LandmarkName_MeteorFalls = encodeOwText("SITE METEORE");

/** 1:1 (landmark.c:34) */
const LandmarkName_TunnelersRestHouse = encodeOwText("REFUGE DES FOREURS");

/** 1:1 (landmark.c:35) */
const LandmarkName_RusturfTunnel = encodeOwText("TUNNEL MERAZON");

/** 1:1 (landmark.c:36) */
const LandmarkName_PokemonDayCare = encodeOwText("PENSION POKéMON");

/** 1:1 (landmark.c:37) */
const LandmarkName_SafariZoneEntrance = encodeOwText("ENTREE PARC SAFARI");

/** 1:1 (landmark.c:38) */
const LandmarkName_MtPyre = encodeOwText("MONT MEMORIA");

/** 1:1 (landmark.c:39) */
const LandmarkName_ShoalCave = encodeOwText("GROTTE TREFONDS");

/** 1:1 (landmark.c:40) */
const LandmarkName_SeafloorCavern = encodeOwText("CAVERNE FONDMER");

/** 1:1 (landmark.c:41) */
const LandmarkName_GraniteCave = encodeOwText("GROTTE GRANITE");

/** 1:1 (landmark.c:42) */
const LandmarkName_OceanCurrent = encodeOwText("COURANT OCEANIQUE");

/** 1:1 (landmark.c:43) */
const LandmarkName_LanettesHouse = encodeOwText("MAISON D'ANNETTE");

/** 1:1 (landmark.c:44) */
const LandmarkName_FieryPath = encodeOwText("CHEMIN ARDENT");

/** 1:1 (landmark.c:45) */
const LandmarkName_JaggedPass = encodeOwText("SENTIER SINUROC");

/** 1:1 (landmark.c:46) */
const LandmarkName_SkyPillar = encodeOwText("PILIER CELESTE");

/** 1:1 (landmark.c:47) */
const LandmarkName_BerryMastersHouse = encodeOwText("MAITRE DES BAIES");

/** 1:1 (landmark.c:48) */
const LandmarkName_IslandCave = encodeOwText("GROTTE ISLAND");

/** 1:1 (landmark.c:49) */
const LandmarkName_DesertRuins = encodeOwText("RUINES DESERT");

/** 1:1 (landmark.c:50) */
const LandmarkName_ScorchedSlab = encodeOwText("GROTTE ZENITH");

/** 1:1 (landmark.c:51) */
const LandmarkName_AncientTomb = encodeOwText("TOMBEAU ANTIQUE");

/** 1:1 (landmark.c:52) */
const LandmarkName_SealedChamber = encodeOwText("SANCTUAIRE");

/** 1:1 (landmark.c:53) */
const LandmarkName_FossilManiacsHouse = encodeOwText("MANIAQUE DES FOSSILES");

/** 1:1 (landmark.c:54) */
const LandmarkName_HuntersHouse = encodeOwText("CHERCHEUR DE TRESORS");

/** 1:1 (landmark.c:55) */
const LandmarkName_MagmaHideout = encodeOwText("PLANQUE MAGMA");

/** 1:1 (landmark.c:56) */
const LandmarkName_MirageTower = encodeOwText("TOUR MIRAGE");

/** 1:1 (landmark.c:57) */
const LandmarkName_AlteringCave = encodeOwText("GROTTE METAMO");

/** 1:1 (landmark.c:58) */
const LandmarkName_DesertUnderpass = encodeOwText("VOIE DU DESERT");

/** 1:1 (landmark.c:59) */
const LandmarkName_TrainerHill = encodeOwText("MONT DRESSEURS");

/** 1:1 (landmark.c:61) */
const Landmark_FlowerShop = {
  name: LandmarkName_FlowerShop,
  flag: FLAG_LANDMARK_FLOWER_SHOP,
};

/** 1:1 (landmark.c:62) */
const Landmark_PetalburgWoods = {
  name: LandmarkName_PetalburgWoods,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:63) */
const Landmark_MrBrineysCottage = {
  name: LandmarkName_MrBrineysCottage,
  flag: FLAG_LANDMARK_MR_BRINEY_HOUSE,
};

/** 1:1 (landmark.c:64) */
const Landmark_AbandonedShip = {
  name: LandmarkName_AbandonedShip,
  flag: FLAG_LANDMARK_ABANDONED_SHIP,
};

/** 1:1 (landmark.c:65) */
const Landmark_SeashoreHouse = {
  name: LandmarkName_SeashoreHouse,
  flag: FLAG_LANDMARK_SEASHORE_HOUSE,
};

/** 1:1 (landmark.c:66) */
const Landmark_SlateportBeach = {
  name: LandmarkName_SlateportBeach,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:67) */
const Landmark_CyclingRoad = {
  name: LandmarkName_CyclingRoad,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:68) */
const Landmark_NewMauville = {
  name: LandmarkName_NewMauville,
  flag: FLAG_LANDMARK_NEW_MAUVILLE,
};

/** 1:1 (landmark.c:69) */
const Landmark_TrickHouse = {
  name: LandmarkName_TrickHouse,
  flag: FLAG_LANDMARK_TRICK_HOUSE,
};

/** 1:1 (landmark.c:70) */
const Landmark_OldLadysRestShop = {
  name: LandmarkName_OldLadysRestShop,
  flag: FLAG_LANDMARK_OLD_LADY_REST_SHOP,
};

/** 1:1 (landmark.c:71) */
const Landmark_Desert = {
  name: LandmarkName_Desert,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:72) */
const Landmark_WinstrateFamily = {
  name: LandmarkName_WinstrateFamily,
  flag: FLAG_LANDMARK_WINSTRATE_FAMILY,
};

/** 1:1 (landmark.c:73) */
const Landmark_CableCar = {
  name: LandmarkName_CableCar,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:74) */
const Landmark_GlassWorkshop = {
  name: LandmarkName_GlassWorkshop,
  flag: FLAG_LANDMARK_GLASS_WORKSHOP,
};

/** 1:1 (landmark.c:75) */
const Landmark_WeatherInstitute = {
  name: LandmarkName_WeatherInstitute,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:76) */
const Landmark_MeteorFalls = {
  name: LandmarkName_MeteorFalls,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:77) */
const Landmark_TunnelersRestHouse = {
  name: LandmarkName_TunnelersRestHouse,
  flag: FLAG_LANDMARK_TUNNELERS_REST_HOUSE,
};

/** 1:1 (landmark.c:78) */
const Landmark_RusturfTunnel = {
  name: LandmarkName_RusturfTunnel,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:79) */
const Landmark_PokemonDayCare = {
  name: LandmarkName_PokemonDayCare,
  flag: FLAG_LANDMARK_POKEMON_DAYCARE,
};

/** 1:1 (landmark.c:80) */
const Landmark_SafariZoneEntrance = {
  name: LandmarkName_SafariZoneEntrance,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:81) */
const Landmark_MtPyre = {
  name: LandmarkName_MtPyre,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:82) */
const Landmark_ShoalCave = {
  name: LandmarkName_ShoalCave,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:83) */
const Landmark_SeafloorCavern = {
  name: LandmarkName_SeafloorCavern,
  flag: FLAG_LANDMARK_SEAFLOOR_CAVERN,
};

/** 1:1 (landmark.c:84) */
const Landmark_GraniteCave = {
  name: LandmarkName_GraniteCave,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:85) */
const Landmark_OceanCurrent = {
  name: LandmarkName_OceanCurrent,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:86) */
const Landmark_LanettesHouse = {
  name: LandmarkName_LanettesHouse,
  flag: FLAG_LANDMARK_LANETTES_HOUSE,
};

/** 1:1 (landmark.c:87) */
const Landmark_FieryPath = {
  name: LandmarkName_FieryPath,
  flag: FLAG_LANDMARK_FIERY_PATH,
};

/** 1:1 (landmark.c:88) */
const Landmark_JaggedPass = {
  name: LandmarkName_JaggedPass,
  flag: (-1 & 0xFFFF) /* wrap C u16 */,
};

/** 1:1 (landmark.c:89) */
const Landmark_BerryMastersHouse = {
  name: LandmarkName_BerryMastersHouse,
  flag: FLAG_LANDMARK_BERRY_MASTERS_HOUSE,
};

/** 1:1 (landmark.c:90) */
const Landmark_IslandCave = {
  name: LandmarkName_IslandCave,
  flag: FLAG_LANDMARK_ISLAND_CAVE,
};

/** 1:1 (landmark.c:91) */
const Landmark_DesertRuins = {
  name: LandmarkName_DesertRuins,
  flag: FLAG_LANDMARK_DESERT_RUINS,
};

/** 1:1 (landmark.c:92) */
const Landmark_ScorchedSlab = {
  name: LandmarkName_ScorchedSlab,
  flag: FLAG_LANDMARK_SCORCHED_SLAB,
};

/** 1:1 (landmark.c:93) */
const Landmark_AncientTomb = {
  name: LandmarkName_AncientTomb,
  flag: FLAG_LANDMARK_ANCIENT_TOMB,
};

/** 1:1 (landmark.c:94) */
const Landmark_SealedChamber = {
  name: LandmarkName_SealedChamber,
  flag: FLAG_LANDMARK_SEALED_CHAMBER,
};

/** 1:1 (landmark.c:95) */
const Landmark_FossilManiacsHouse = {
  name: LandmarkName_FossilManiacsHouse,
  flag: FLAG_LANDMARK_FOSSIL_MANIACS_HOUSE,
};

/** 1:1 (landmark.c:96) */
const Landmark_HuntersHouse = {
  name: LandmarkName_HuntersHouse,
  flag: FLAG_LANDMARK_HUNTERS_HOUSE,
};

/** 1:1 (landmark.c:97) */
const Landmark_SkyPillar = {
  name: LandmarkName_SkyPillar,
  flag: FLAG_LANDMARK_SKY_PILLAR,
};

/** 1:1 (landmark.c:98) */
const Landmark_MirageTower = {
  name: LandmarkName_MirageTower,
  flag: FLAG_LANDMARK_MIRAGE_TOWER,
};

/** 1:1 (landmark.c:99) */
const Landmark_AlteringCave = {
  name: LandmarkName_AlteringCave,
  flag: FLAG_LANDMARK_ALTERING_CAVE,
};

/** 1:1 (landmark.c:100) */
const Landmark_DesertUnderpass = {
  name: LandmarkName_DesertUnderpass,
  flag: FLAG_LANDMARK_DESERT_UNDERPASS,
};

/** 1:1 (landmark.c:101) */
const Landmark_TrainerHill = {
  name: LandmarkName_TrainerHill,
  flag: FLAG_LANDMARK_TRAINER_HILL,
};

/** 1:1 (landmark.c:103) */
const Landmarks_Route103_2 = [
  Landmark_AlteringCave,
  null,
];

/** 1:1 (landmark.c:109) */
const Landmarks_Route104_0 = [
  Landmark_FlowerShop,
  null,
];

/** 1:1 (landmark.c:115) */
const Landmarks_Route104_1 = [
  Landmark_PetalburgWoods,
  Landmark_MrBrineysCottage,
  null,
];

/** 1:1 (landmark.c:122) */
const Landmarks_Route105_0 = [
  Landmark_IslandCave,
  null,
];

/** 1:1 (landmark.c:128) */
const Landmarks_Route106_1 = [
  Landmark_GraniteCave,
  null,
];

/** 1:1 (landmark.c:134) */
const Landmarks_Route108_0 = [
  Landmark_AbandonedShip,
  null,
];

/** 1:1 (landmark.c:140) */
const Landmarks_Route109_0 = [
  Landmark_SeashoreHouse,
  Landmark_SlateportBeach,
  null,
];

/** 1:1 (landmark.c:147) */
const Landmarks_Route110_0 = [
  Landmark_CyclingRoad,
  Landmark_NewMauville,
  null,
];

/** 1:1 (landmark.c:154) */
const Landmarks_Route110_1 = [
  Landmark_CyclingRoad,
  null,
];

/** 1:1 (landmark.c:160) */
const Landmarks_Route110_2 = [
  Landmark_CyclingRoad,
  Landmark_TrickHouse,
  null,
];

/** 1:1 (landmark.c:167) */
const Landmarks_Route111_0 = [
  Landmark_OldLadysRestShop,
  null,
];

/** 1:1 (landmark.c:173) */
const Landmarks_Route111_1 = [
  Landmark_Desert,
  null,
];

/** 1:1 (landmark.c:179) */
const Landmarks_Route111_2 = [
  Landmark_MirageTower,
  Landmark_Desert,
  null,
];

/** 1:1 (landmark.c:186) */
const Landmarks_Route111_3 = [
  Landmark_DesertRuins,
  Landmark_Desert,
  null,
];

/** 1:1 (landmark.c:193) */
const Landmarks_Route111_4 = [
  Landmark_TrainerHill,
  Landmark_WinstrateFamily,
  Landmark_Desert,
  null,
];

/** 1:1 (landmark.c:201) */
const Landmarks_Route112_0 = [
  Landmark_FieryPath,
  Landmark_JaggedPass,
  null,
];

/** 1:1 (landmark.c:208) */
const Landmarks_Route112_1 = [
  Landmark_CableCar,
  Landmark_FieryPath,
  null,
];

/** 1:1 (landmark.c:215) */
const Landmarks_Route113_1 = [
  Landmark_GlassWorkshop,
  null,
];

/** 1:1 (landmark.c:221) */
const Landmarks_Route114_1 = [
  Landmark_DesertUnderpass,
  Landmark_FossilManiacsHouse,
  null,
];

/** 1:1 (landmark.c:228) */
const Landmarks_Route114_2 = [
  Landmark_LanettesHouse,
  null,
];

/** 1:1 (landmark.c:234) */
const Landmarks_MeteorFalls = [
  Landmark_MeteorFalls,
  null,
];

/** 1:1 (landmark.c:240) */
const Landmarks_Route116_1 = [
  Landmark_TunnelersRestHouse,
  Landmark_RusturfTunnel,
  null,
];

/** 1:1 (landmark.c:247) */
const Landmarks_Route116_2 = [
  Landmark_RusturfTunnel,
  null,
];

/** 1:1 (landmark.c:253) */
const Landmarks_Route117_2 = [
  Landmark_PokemonDayCare,
  null,
];

/** 1:1 (landmark.c:259) */
const Landmarks_Route119_1 = [
  Landmark_WeatherInstitute,
  null,
];

/** 1:1 (landmark.c:265) */
const Landmarks_Route120_0 = [
  Landmark_ScorchedSlab,
  null,
];

/** 1:1 (landmark.c:271) */
const Landmarks_Route120_2 = [
  Landmark_AncientTomb,
  null,
];

/** 1:1 (landmark.c:277) */
const Landmarks_Route121_2 = [
  Landmark_SafariZoneEntrance,
  null,
];

/** 1:1 (landmark.c:283) */
const Landmarks_Route122_0 = [
  Landmark_MtPyre,
  null,
];

/** 1:1 (landmark.c:289) */
const Landmarks_Route123_0 = [
  Landmark_BerryMastersHouse,
  null,
];

/** 1:1 (landmark.c:295) */
const Landmarks_Route124_7 = [
  Landmark_HuntersHouse,
  null,
];

/** 1:1 (landmark.c:301) */
const Landmarks_Route125_2 = [
  Landmark_ShoalCave,
  null,
];

/** 1:1 (landmark.c:307) */
const Landmarks_Route128_1 = [
  Landmark_SeafloorCavern,
  null,
];

/** 1:1 (landmark.c:313) */
const Landmarks_Route131_1 = [
  Landmark_SkyPillar,
  null,
];

/** 1:1 (landmark.c:319) */
const Landmarks_OceanCurrent = [
  Landmark_OceanCurrent,
  null,
];

/** 1:1 (landmark.c:325) */
const Landmarks_Route134_2 = [
  Landmark_SealedChamber,
  Landmark_OceanCurrent,
  null,
];

/** 1:1 (landmark.c:332) */
const Landmarks_MtChimney_2 = [
  Landmark_CableCar,
  Landmark_JaggedPass,
  null,
];

/** 1:1 (landmark.c:339) */
const sLandmarkLists = [
  {
    mapSection: MAPSEC_ROUTE_103,
    id: 2,
    landmarks: Landmarks_Route103_2,
  },
  {
    mapSection: MAPSEC_ROUTE_104,
    id: 0,
    landmarks: Landmarks_Route104_0,
  },
  {
    mapSection: MAPSEC_ROUTE_104,
    id: 1,
    landmarks: Landmarks_Route104_1,
  },
  {
    mapSection: MAPSEC_ROUTE_105,
    id: 0,
    landmarks: Landmarks_Route105_0,
  },
  {
    mapSection: MAPSEC_ROUTE_106,
    id: 1,
    landmarks: Landmarks_Route106_1,
  },
  {
    mapSection: MAPSEC_ROUTE_108,
    id: 0,
    landmarks: Landmarks_Route108_0,
  },
  {
    mapSection: MAPSEC_ROUTE_109,
    id: 0,
    landmarks: Landmarks_Route109_0,
  },
  {
    mapSection: MAPSEC_ROUTE_110,
    id: 0,
    landmarks: Landmarks_Route110_0,
  },
  {
    mapSection: MAPSEC_ROUTE_110,
    id: 1,
    landmarks: Landmarks_Route110_1,
  },
  {
    mapSection: MAPSEC_ROUTE_110,
    id: 2,
    landmarks: Landmarks_Route110_2,
  },
  {
    mapSection: MAPSEC_ROUTE_111,
    id: 0,
    landmarks: Landmarks_Route111_0,
  },
  {
    mapSection: MAPSEC_ROUTE_111,
    id: 1,
    landmarks: Landmarks_Route111_1,
  },
  {
    mapSection: MAPSEC_ROUTE_111,
    id: 2,
    landmarks: Landmarks_Route111_2,
  },
  {
    mapSection: MAPSEC_ROUTE_111,
    id: 3,
    landmarks: Landmarks_Route111_3,
  },
  {
    mapSection: MAPSEC_ROUTE_111,
    id: 4,
    landmarks: Landmarks_Route111_4,
  },
  {
    mapSection: MAPSEC_ROUTE_112,
    id: 0,
    landmarks: Landmarks_Route112_0,
  },
  {
    mapSection: MAPSEC_ROUTE_112,
    id: 1,
    landmarks: Landmarks_Route112_1,
  },
  {
    mapSection: MAPSEC_ROUTE_113,
    id: 1,
    landmarks: Landmarks_Route113_1,
  },
  {
    mapSection: MAPSEC_ROUTE_114,
    id: 1,
    landmarks: Landmarks_Route114_1,
  },
  {
    mapSection: MAPSEC_ROUTE_114,
    id: 2,
    landmarks: Landmarks_Route114_2,
  },
  {
    mapSection: MAPSEC_ROUTE_114,
    id: 3,
    landmarks: Landmarks_MeteorFalls,
  },
  {
    mapSection: MAPSEC_ROUTE_115,
    id: 0,
    landmarks: Landmarks_MeteorFalls,
  },
  {
    mapSection: MAPSEC_ROUTE_115,
    id: 1,
    landmarks: Landmarks_MeteorFalls,
  },
  {
    mapSection: MAPSEC_ROUTE_116,
    id: 1,
    landmarks: Landmarks_Route116_1,
  },
  {
    mapSection: MAPSEC_ROUTE_116,
    id: 2,
    landmarks: Landmarks_Route116_2,
  },
  {
    mapSection: MAPSEC_ROUTE_117,
    id: 2,
    landmarks: Landmarks_Route117_2,
  },
  {
    mapSection: MAPSEC_ROUTE_119,
    id: 1,
    landmarks: Landmarks_Route119_1,
  },
  {
    mapSection: MAPSEC_ROUTE_120,
    id: 0,
    landmarks: Landmarks_Route120_0,
  },
  {
    mapSection: MAPSEC_ROUTE_120,
    id: 2,
    landmarks: Landmarks_Route120_2,
  },
  {
    mapSection: MAPSEC_ROUTE_121,
    id: 2,
    landmarks: Landmarks_Route121_2,
  },
  {
    mapSection: MAPSEC_ROUTE_122,
    id: 0,
    landmarks: Landmarks_Route122_0,
  },
  {
    mapSection: MAPSEC_ROUTE_123,
    id: 0,
    landmarks: Landmarks_Route123_0,
  },
  {
    mapSection: MAPSEC_ROUTE_122,
    id: 1,
    landmarks: Landmarks_Route122_0,
  },
  {
    mapSection: MAPSEC_ROUTE_124,
    id: 7,
    landmarks: Landmarks_Route124_7,
  },
  {
    mapSection: MAPSEC_ROUTE_125,
    id: 2,
    landmarks: Landmarks_Route125_2,
  },
  {
    mapSection: MAPSEC_ROUTE_128,
    id: 1,
    landmarks: Landmarks_Route128_1,
  },
  {
    mapSection: MAPSEC_ROUTE_131,
    id: 1,
    landmarks: Landmarks_Route131_1,
  },
  {
    mapSection: MAPSEC_ROUTE_132,
    id: 0,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_132,
    id: 1,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_133,
    id: 0,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_133,
    id: 1,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_133,
    id: 2,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_134,
    id: 0,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_134,
    id: 1,
    landmarks: Landmarks_OceanCurrent,
  },
  {
    mapSection: MAPSEC_ROUTE_134,
    id: 2,
    landmarks: Landmarks_Route134_2,
  },
  {
    mapSection: MAPSEC_MT_CHIMNEY,
    id: 2,
    landmarks: Landmarks_MtChimney_2,
  },
  {
    mapSection: MAPSEC_NONE,
    id: 0,
    landmarks: null,
  },
];

/** 1:1 `const u8 *GetLandmarkName(mapsec_u8_t mapSection, u8 id, u8 count)` (landmark.c:397-422).
 *  Revue transpiler : `landmarks++`/`*landmarks` (itération pointeur sur liste NULL-terminée) → index li. */
export function GetLandmarkName(mapSection: number, id: number, count: number): Uint8Array | null {
  const landmarks = GetLandmarks(mapSection, id);
  if (!landmarks)
    return null;
  let li = 0;
  while (1)
  {
    const landmark = landmarks[li]!;
    if (landmark.flag == 0xFFFF || FlagGet(landmark.flag) == true)
    {
      if (count == 0)
        break;
      else
        count--;
    }
    li++;
    if (!landmarks[li])
      return null;
  }
  return landmarks[li]!.name;
}

/** 1:1 `static const struct Landmark *const *GetLandmarks(mapsec_u8_t mapSection, u8 id)` (landmark.c:424-446).
 *  Revue transpiler : retour `Landmark *const *` (liste NULL-terminée) → `(Landmark | null)[] | null`. */
function GetLandmarks(mapSection: number, id: number): ReadonlyArray<Landmark | null> | null {
  let i = 0;
  for (; sLandmarkLists[i].mapSection != MAPSEC_NONE; i++)
  {
    if (sLandmarkLists[i].mapSection > mapSection)
      return null;
    if (sLandmarkLists[i].mapSection == mapSection)
      break;
  }
  if (sLandmarkLists[i].mapSection == MAPSEC_NONE)
    return null;
  for (; sLandmarkLists[i].mapSection == mapSection; i++)
  {
    if (sLandmarkLists[i].id == id)
      return sLandmarkLists[i].landmarks;
  }
  return null;
}
