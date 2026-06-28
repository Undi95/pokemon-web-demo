/**
 * berry_tree_graphics_tables.ts — Port 1:1 STRICT decomp.
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/berry_tree_graphics_tables.h
 * gBerryTreePicTableBuilders : berryId -> (png, builder sPicTable). Re-exporte
 * sAnimTable_BerryTree (anims du sprite) pour le spawner berry tree.
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
  build_sPicTable_AguavBerryTree,
  build_sPicTable_AspearBerryTree,
  build_sPicTable_CheriBerryTree,
  build_sPicTable_ChestoBerryTree,
  build_sPicTable_CornnBerryTree,
  build_sPicTable_DurinBerryTree,
  build_sPicTable_FigyBerryTree,
  build_sPicTable_GrepaBerryTree,
  build_sPicTable_HondewBerryTree,
  build_sPicTable_IapapaBerryTree,
  build_sPicTable_KelpsyBerryTree,
  build_sPicTable_LansatBerryTree,
  build_sPicTable_LeppaBerryTree,
  build_sPicTable_LiechiBerryTree,
  build_sPicTable_LumBerryTree,
  build_sPicTable_MagoBerryTree,
  build_sPicTable_NomelBerryTree,
  build_sPicTable_OranBerryTree,
  build_sPicTable_PamtreBerryTree,
  build_sPicTable_PechaBerryTree,
  build_sPicTable_PersimBerryTree,
  build_sPicTable_PomegBerryTree,
  build_sPicTable_RabutaBerryTree,
  build_sPicTable_RawstBerryTree,
  build_sPicTable_RazzBerryTree,
  build_sPicTable_SitrusBerryTree,
  build_sPicTable_SpelonBerryTree,
  build_sPicTable_TamatoBerryTree,
  build_sPicTable_WepearBerryTree,
  build_sPicTable_WikiBerryTree,
} from './object_event_pic_tables';

// ─── gBerryTreePicTablePointers 1:1 décomp ──────────────────────────────────
// Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/
//          berry_tree_graphics_tables.h:425-469.
//
// Indexé par berryId = ITEM_X_BERRY - FIRST_BERRY_INDEX (= berryType - 1, où
// berryType = ITEM_TO_BERRY(item) ∈ [1..43]). Chaque entrée mappe :
//   - png   : nom du fichier baie sous public/decomp/em/object_events/berry_trees/
//   - build : le builder sPicTable correspondant (9 frames = dirt + sprout×2 +
//             baie×6, cf berry_tree_graphics_tables.h:1-11).
// Les baies « partagées » (BLUK→Razz, NANAB→Mago, …) pointent vers le même
// builder + png que leur baie de référence — 1:1 décomp (lignes 442-468).
//
// Re-export `sAnimTable_BerryTree` (= anims du sprite, sélection animNum par
// stade) pour le spawner berry tree de object-events.ts.
export { sAnimTable_BerryTree };

export interface BerryTreePicTableBuilder {
  readonly png: string;
  readonly build: (dirt: Uint8Array, sprout: Uint8Array, berry: Uint8Array) => SpriteFrameImage[];
}

export const gBerryTreePicTableBuilders: ReadonlyArray<BerryTreePicTableBuilder> = [
  { png: 'cheri',  build: build_sPicTable_CheriBerryTree },   // 0  ITEM_CHERI_BERRY
  { png: 'chesto', build: build_sPicTable_ChestoBerryTree },  // 1  ITEM_CHESTO_BERRY
  { png: 'pecha',  build: build_sPicTable_PechaBerryTree },   // 2  ITEM_PECHA_BERRY
  { png: 'rawst',  build: build_sPicTable_RawstBerryTree },   // 3  ITEM_RAWST_BERRY
  { png: 'aspear', build: build_sPicTable_AspearBerryTree },  // 4  ITEM_ASPEAR_BERRY
  { png: 'leppa',  build: build_sPicTable_LeppaBerryTree },   // 5  ITEM_LEPPA_BERRY
  { png: 'oran',   build: build_sPicTable_OranBerryTree },    // 6  ITEM_ORAN_BERRY
  { png: 'persim', build: build_sPicTable_PersimBerryTree },  // 7  ITEM_PERSIM_BERRY
  { png: 'lum',    build: build_sPicTable_LumBerryTree },     // 8  ITEM_LUM_BERRY
  { png: 'sitrus', build: build_sPicTable_SitrusBerryTree },  // 9  ITEM_SITRUS_BERRY
  { png: 'figy',   build: build_sPicTable_FigyBerryTree },    // 10 ITEM_FIGY_BERRY
  { png: 'wiki',   build: build_sPicTable_WikiBerryTree },    // 11 ITEM_WIKI_BERRY
  { png: 'mago',   build: build_sPicTable_MagoBerryTree },    // 12 ITEM_MAGO_BERRY
  { png: 'aguav',  build: build_sPicTable_AguavBerryTree },   // 13 ITEM_AGUAV_BERRY
  { png: 'iapapa', build: build_sPicTable_IapapaBerryTree },  // 14 ITEM_IAPAPA_BERRY
  { png: 'razz',   build: build_sPicTable_RazzBerryTree },    // 15 ITEM_RAZZ_BERRY
  { png: 'razz',   build: build_sPicTable_RazzBerryTree },    // 16 ITEM_BLUK_BERRY   → Razz
  { png: 'mago',   build: build_sPicTable_MagoBerryTree },    // 17 ITEM_NANAB_BERRY  → Mago
  { png: 'wepear', build: build_sPicTable_WepearBerryTree },  // 18 ITEM_WEPEAR_BERRY
  { png: 'iapapa', build: build_sPicTable_IapapaBerryTree },  // 19 ITEM_PINAP_BERRY  → Iapapa
  { png: 'pomeg',  build: build_sPicTable_PomegBerryTree },   // 20 ITEM_POMEG_BERRY
  { png: 'kelpsy', build: build_sPicTable_KelpsyBerryTree },  // 21 ITEM_KELPSY_BERRY
  { png: 'wepear', build: build_sPicTable_WepearBerryTree },  // 22 ITEM_QUALOT_BERRY → Wepear
  { png: 'hondew', build: build_sPicTable_HondewBerryTree },  // 23 ITEM_HONDEW_BERRY
  { png: 'grepa',  build: build_sPicTable_GrepaBerryTree },   // 24 ITEM_GREPA_BERRY
  { png: 'tamato', build: build_sPicTable_TamatoBerryTree },  // 25 ITEM_TAMATO_BERRY
  { png: 'cornn',  build: build_sPicTable_CornnBerryTree },   // 26 ITEM_CORNN_BERRY
  { png: 'pomeg',  build: build_sPicTable_PomegBerryTree },   // 27 ITEM_MAGOST_BERRY → Pomeg
  { png: 'rabuta', build: build_sPicTable_RabutaBerryTree },  // 28 ITEM_RABUTA_BERRY
  { png: 'nomel',  build: build_sPicTable_NomelBerryTree },   // 29 ITEM_NOMEL_BERRY
  { png: 'spelon', build: build_sPicTable_SpelonBerryTree },  // 30 ITEM_SPELON_BERRY
  { png: 'pamtre', build: build_sPicTable_PamtreBerryTree },  // 31 ITEM_PAMTRE_BERRY
  { png: 'rabuta', build: build_sPicTable_RabutaBerryTree },  // 32 ITEM_WATMEL_BERRY → Rabuta
  { png: 'durin',  build: build_sPicTable_DurinBerryTree },   // 33 ITEM_DURIN_BERRY
  { png: 'hondew', build: build_sPicTable_HondewBerryTree },  // 34 ITEM_BELUE_BERRY  → Hondew
  { png: 'liechi', build: build_sPicTable_LiechiBerryTree },  // 35 ITEM_LIECHI_BERRY
  { png: 'hondew', build: build_sPicTable_HondewBerryTree },  // 36 ITEM_GANLON_BERRY → Hondew
  { png: 'aguav',  build: build_sPicTable_AguavBerryTree },   // 37 ITEM_SALAC_BERRY  → Aguav
  { png: 'pomeg',  build: build_sPicTable_PomegBerryTree },   // 38 ITEM_PETAYA_BERRY → Pomeg
  { png: 'grepa',  build: build_sPicTable_GrepaBerryTree },   // 39 ITEM_APICOT_BERRY → Grepa
  { png: 'lansat', build: build_sPicTable_LansatBerryTree },  // 40 ITEM_LANSAT_BERRY
  { png: 'cornn',  build: build_sPicTable_CornnBerryTree },   // 41 ITEM_STARF_BERRY  → Cornn
  { png: 'durin',  build: build_sPicTable_DurinBerryTree },   // 42 ITEM_ENIGMA_BERRY → Durin
];
