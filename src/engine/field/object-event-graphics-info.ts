/**
 * object-event-graphics-info.ts — Port 1:1 STRICT décomp pure.
 *
 * Sources uniques de vérité (= ne JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/include/sprite.h
 *   D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info.h
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h
 *   D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_graphics_info_pointers.h
 *
 * Structs portées 1:1 :
 *   struct SpriteFrameImage (= sprite.h:26-30)
 *   struct SpriteTemplate (= sprite.h:179-188)
 *   struct ObjectEventGraphicsInfo (= global.fieldmap.h:257-275)
 *
 * Tables portées 1:1 (= partielles, NPCs visibles game start) :
 *   sPicTable_Mom (= object_event_pic_tables.h:1892-1902) — 9 frames 16x32
 *   gObjectEventGraphicsInfo_Mom (= object_event_graphics_info.h:4143-4160)
 *
 * Le décomp utilise `INCBIN_U8` pour charger les bytes raw de la ROM. Notre
 * port charge async PNG → convertit 4bpp raw (loadTileBin) → stock dans
 * Uint8Array. Au build du sPicTable_*, on slice ce buffer par frame.
 *
 * `overworld_frame(ptr, width, height, frame)` macro (sprite.h:34) :
 *   .data = ptr + (width * height * frame * 64)/2
 *   .size = (width * height * 64)/2
 * Pour MOM (16x32 = 2x4 tiles) : size = 2*4*64/2 = 256 bytes par frame.
 */

import type { OamData } from './object-event-base-oam';
import { gObjectEventBaseOam_16x32 } from './object-event-base-oam';

// ─── struct SpriteFrameImage 1:1 décomp sprite.h:26-30 ─────────────────────
/**
 *  struct SpriteFrameImage {
 *      const void *data;
 *      u16 size;
 *  };
 *
 *  `data` = pointer vers bytes raw 4bpp (= 1 frame d'animation).
 *  `size` = taille en bytes (= width_tiles * height_tiles * 32, ou via
 *  `overworld_frame(ptr, w, h, frame)` = (w*h*64)/2).
 */
export interface SpriteFrameImage {
  data: Uint8Array;
  size: number;
}

// ─── struct SpriteTemplate 1:1 décomp sprite.h:179-188 ─────────────────────
/**
 *  struct SpriteTemplate {
 *      u16 tileTag;
 *      u16 paletteTag;
 *      const struct OamData *oam;
 *      const union AnimCmd *const *anims;
 *      const struct SpriteFrameImage *images;
 *      const union AffineAnimCmd *const *affineAnims;
 *      SpriteCallback callback;
 *  };
 *
 *  Construit par `MakeSpriteTemplateFromObjectEventTemplate` puis passé à
 *  `CreateSprite(template, x, y, subpriority)`.
 *
 *  tileTag = TAG_NONE (= 0xFFFF) déclenche branch `images` dans CreateSpriteAt
 *  (sprite.c:562-575) qui appelle `AllocSpriteTiles(images[0].size/TILE_SIZE_
 *  4BPP)` et set sprite->images = template->images + sprite->usingSheet = FALSE.
 */
export interface SpriteTemplate {
  tileTag: number;      // u16, TAG_NONE = 0xFFFF
  paletteTag: number;   // u16
  oam: OamData;         // struct OamData* — copié dans sprite via *template.oam
  anims: unknown[] | null;  // union AnimCmd *const * — port différé
  images: SpriteFrameImage[];  // struct SpriteFrameImage * — frames table
  affineAnims: unknown[] | null;  // union AffineAnimCmd *const * — port différé
  callback: ((spriteId: number) => void) | null;  // SpriteCallback (fn pointer)
}

// ─── struct ObjectEventGraphicsInfo 1:1 décomp global.fieldmap.h:257-275 ───
/**
 *  struct ObjectEventGraphicsInfo {
 *      u16 tileTag;
 *      u16 paletteTag;
 *      u16 reflectionPaletteTag;
 *      u16 size;
 *      s16 width;
 *      s16 height;
 *      u8 paletteSlot:4;
 *      u8 shadowSize:2;
 *      u8 inanimate:1;
 *      u8 disableReflectionPaletteLoad:1;
 *      u8 tracks;
 *      const struct OamData *oam;
 *      const struct SubspriteTable *subspriteTables;
 *      const union AnimCmd *const *anims;
 *      const struct SpriteFrameImage *images;
 *      const union AffineAnimCmd *const *affineAnims;
 *  };
 *
 *  Une instance par graphicsId (= 300+ records dans le décomp). Référencée
 *  via `gObjectEventGraphicsInfoPointers[graphicsId]`. Lookup via
 *  `GetObjectEventGraphicsInfo(graphicsId)` (event_object_movement.c).
 *
 *  Tags décomp :
 *    OBJ_EVENT_PAL_TAG_NONE = 0x11FF (= u16 sentinel)
 *    PALSLOT_PLAYER = 0
 *    PALSLOT_NPC_1..NPC_4 = 1..4
 *    PALSLOT_NPC_SPECIAL = 5
 *    SHADOW_SIZE_S/M/L/XL = 0..3
 *    TRACKS_NONE/FOOT/BIKE_TIRE/SLITHER = 0..3
 */
export interface ObjectEventGraphicsInfo {
  /*0x00*/ tileTag: number;            // u16, généralement TAG_NONE (= 0xFFFF)
  /*0x02*/ paletteTag: number;         // u16, OBJ_EVENT_PAL_TAG_*
  /*0x04*/ reflectionPaletteTag: number;  // u16
  /*0x06*/ size: number;               // u16 — bytes par 1 frame (= overworld_frame size)
  /*0x08*/ width: number;              // s16 — pixels (16, 32, 48, 64)
  /*0x0A*/ height: number;             // s16 — pixels
  /*0x0C*/ paletteSlot: number;        // u8:4 — 0..15, PALSLOT_*
           shadowSize: number;         // u8:2 — 0..3, SHADOW_SIZE_*
           inanimate: 0 | 1;           // u8:1
           disableReflectionPaletteLoad: 0 | 1;  // u8:1
  /*0x0D*/ tracks: number;             // u8 — TRACKS_*
  /*0x10*/ oam: OamData;               // struct OamData *
  /*0x14*/ subspriteTables: unknown[] | null;   // struct SubspriteTable * — port différé
  /*0x18*/ anims: unknown[] | null;             // union AnimCmd *const *
  /*0x1C*/ images: SpriteFrameImage[];          // struct SpriteFrameImage *
  /*0x20*/ affineAnims: unknown[] | null;       // union AffineAnimCmd *const *
}

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `include/constants/event_objects.h` + `sprite.h`. */
export const TAG_NONE = 0xFFFF;

/** 1:1 décomp `event_object_movement.c:435-471` OBJ_EVENT_PAL_TAG_*. */
export const OBJ_EVENT_PAL_TAG_BRENDAN = 0x1100;
export const OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION = 0x1101;
export const OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION = 0x1102;
export const OBJ_EVENT_PAL_TAG_NPC_1 = 0x1103;
export const OBJ_EVENT_PAL_TAG_NPC_2 = 0x1104;
export const OBJ_EVENT_PAL_TAG_NPC_3 = 0x1105;
export const OBJ_EVENT_PAL_TAG_NPC_4 = 0x1106;
export const OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION = 0x1107;
export const OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION = 0x1108;
export const OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION = 0x1109;
export const OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION = 0x110A;
export const OBJ_EVENT_PAL_TAG_QUINTY_PLUMP = 0x110B;
export const OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION = 0x110C;
export const OBJ_EVENT_PAL_TAG_TRUCK = 0x110D;
export const OBJ_EVENT_PAL_TAG_VIGOROTH = 0x110E;
export const OBJ_EVENT_PAL_TAG_ZIGZAGOON = 0x110F;
export const OBJ_EVENT_PAL_TAG_MAY = 0x1110;
export const OBJ_EVENT_PAL_TAG_MAY_REFLECTION = 0x1111;
export const OBJ_EVENT_PAL_TAG_MOVING_BOX = 0x1112;
export const OBJ_EVENT_PAL_TAG_CABLE_CAR = 0x1113;
export const OBJ_EVENT_PAL_TAG_SSTIDAL = 0x1114;
export const OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER = 0x1115;
export const OBJ_EVENT_PAL_TAG_KYOGRE = 0x1116;
export const OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION = 0x1117;
export const OBJ_EVENT_PAL_TAG_GROUDON = 0x1118;
export const OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION = 0x1119;
export const OBJ_EVENT_PAL_TAG_UNUSED = 0x111A;
export const OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW = 0x111B;
export const OBJ_EVENT_PAL_TAG_POOCHYENA = 0x111C;
export const OBJ_EVENT_PAL_TAG_RED_LEAF = 0x111D;
export const OBJ_EVENT_PAL_TAG_DEOXYS = 0x111E;
export const OBJ_EVENT_PAL_TAG_BIRTH_ISLAND_STONE = 0x111F;
export const OBJ_EVENT_PAL_TAG_HO_OH = 0x1120;
export const OBJ_EVENT_PAL_TAG_LUGIA = 0x1121;
export const OBJ_EVENT_PAL_TAG_RS_BRENDAN = 0x1122;
export const OBJ_EVENT_PAL_TAG_RS_MAY = 0x1123;
export const OBJ_EVENT_PAL_TAG_NONE = 0x11FF;

/** 1:1 STRICT décomp `include/event_object_movement.h:11-26` PALSLOT_* (schéma RÉSERVÉ
 *  complet 0-11). Les object events occupent les slots OBJ fixes [0, OBJ_PALSLOT_COUNT) ;
 *  les slots 12-15 restent libres pour field effects / interface / **météo** (commentaire
 *  décomp). Les NPC partagent 4 palettes (npc_1..4) + 4 reflets. La météo (AllocSpritePalette)
 *  alloue dans [12,16) grâce à gReservedSpritePaletteCount=OBJ_PALSLOT_COUNT. */
export const PALSLOT_PLAYER = 0;
export const PALSLOT_PLAYER_REFLECTION = 1;
export const PALSLOT_NPC_1 = 2;
export const PALSLOT_NPC_2 = 3;
export const PALSLOT_NPC_3 = 4;
export const PALSLOT_NPC_4 = 5;
export const PALSLOT_NPC_1_REFLECTION = 6;
export const PALSLOT_NPC_2_REFLECTION = 7;
export const PALSLOT_NPC_3_REFLECTION = 8;
export const PALSLOT_NPC_4_REFLECTION = 9;
export const PALSLOT_NPC_SPECIAL = 10;
export const PALSLOT_NPC_SPECIAL_REFLECTION = 11;
export const OBJ_PALSLOT_COUNT = 12;

/** 1:1 STRICT décomp `gReflectionEffectPaletteMap[16]` (event_object_movement.c:182).
 *  Mappe le slot palette MAIN d'un object event → son slot palette REFLET. */
export const gReflectionEffectPaletteMap: ReadonlyArray<number> = (() => {
  const m = new Array<number>(16).fill(0);
  m[PALSLOT_PLAYER] = PALSLOT_PLAYER_REFLECTION;
  m[PALSLOT_PLAYER_REFLECTION] = PALSLOT_PLAYER_REFLECTION;
  m[PALSLOT_NPC_1] = PALSLOT_NPC_1_REFLECTION;
  m[PALSLOT_NPC_2] = PALSLOT_NPC_2_REFLECTION;
  m[PALSLOT_NPC_3] = PALSLOT_NPC_3_REFLECTION;
  m[PALSLOT_NPC_4] = PALSLOT_NPC_4_REFLECTION;
  m[PALSLOT_NPC_1_REFLECTION] = PALSLOT_NPC_1_REFLECTION;
  m[PALSLOT_NPC_2_REFLECTION] = PALSLOT_NPC_2_REFLECTION;
  m[PALSLOT_NPC_3_REFLECTION] = PALSLOT_NPC_3_REFLECTION;
  m[PALSLOT_NPC_4_REFLECTION] = PALSLOT_NPC_4_REFLECTION;
  m[PALSLOT_NPC_SPECIAL] = PALSLOT_NPC_SPECIAL_REFLECTION;
  m[PALSLOT_NPC_SPECIAL_REFLECTION] = PALSLOT_NPC_SPECIAL_REFLECTION;
  return m;
})();

/** 1:1 décomp `include/constants/event_object_movement.h` SHADOW_SIZE_*. */
export const SHADOW_SIZE_S = 0;
export const SHADOW_SIZE_M = 1;
export const SHADOW_SIZE_L = 2;
export const SHADOW_SIZE_XL = 3;

/** 1:1 décomp TRACKS_*. */
export const TRACKS_NONE = 0;
export const TRACKS_FOOT = 1;
export const TRACKS_BIKE_TIRE = 2;
export const TRACKS_SLITHER = 3;

// ─── overworld_frame macro 1:1 décomp sprite.h:34 ──────────────────────────
/**
 *  #define overworld_frame(ptr, width, height, frame) {
 *    .data = (u8 *)ptr + (width * height * frame * 64)/2,
 *    .size = (width * height * 64)/2
 *  }
 *
 *  ptr = byte buffer raw 4bpp (= INCBIN_U8 ou notre PNG décompressé).
 *  width, height = en tiles (pas pixels). width=2, height=4 = 16x32 pixels.
 *  64/2 = 32 bytes par tile 4bpp. (w*h*64/2) = bytes par frame.
 */
export function overworld_frame(
  ptr: Uint8Array,
  widthTiles: number,
  heightTiles: number,
  frameIdx: number,
): SpriteFrameImage {
  const frameSize = (widthTiles * heightTiles * 64) / 2;  // bytes
  const offset = frameSize * frameIdx;
  return {
    data: ptr.subarray(offset, offset + frameSize),
    size: frameSize,
  };
}

// ─── sPicTable builders 1:1 décomp ─────────────────────────────────────────

/**
 *  1:1 décomp `sPicTable_Mom` (object_event_pic_tables.h:1892-1902) :
 *    static const struct SpriteFrameImage sPicTable_Mom[] = {
 *        overworld_frame(gObjectEventPic_Mom, 2, 4, 0),
 *        overworld_frame(gObjectEventPic_Mom, 2, 4, 1),
 *        ...
 *        overworld_frame(gObjectEventPic_Mom, 2, 4, 8),
 *    };
 *
 *  9 frames × 256 bytes = 2304 bytes total. `gObjectEventPic_Mom` est le
 *  Uint8Array décompressé du PNG `mom.png` (= loadTileBin async).
 */
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

// ─── gObjectEventGraphicsInfo_Mom 1:1 décomp ────────────────────────────────

/**
 *  1:1 décomp `gObjectEventGraphicsInfo_Mom` (object_event_graphics_info.h:4143-4160) :
 *
 *  const struct ObjectEventGraphicsInfo gObjectEventGraphicsInfo_Mom = {
 *      .tileTag = TAG_NONE,
 *      .paletteTag = OBJ_EVENT_PAL_TAG_NPC_4,
 *      .reflectionPaletteTag = OBJ_EVENT_PAL_TAG_NONE,
 *      .size = 256,
 *      .width = 16,
 *      .height = 32,
 *      .paletteSlot = PALSLOT_NPC_4,
 *      .shadowSize = SHADOW_SIZE_M,
 *      .inanimate = FALSE,
 *      .disableReflectionPaletteLoad = FALSE,
 *      .tracks = TRACKS_FOOT,
 *      .oam = &gObjectEventBaseOam_16x32,
 *      .subspriteTables = sOamTables_16x32,
 *      .anims = sAnimTable_Standard,
 *      .images = sPicTable_Mom,
 *      .affineAnims = gDummySpriteAffineAnimTable,
 *  };
 *
 *  Notre port construit le record au runtime (= images dépend du PNG loaded).
 *  La fonction factory prend le PNG décompressé en argument et retourne le
 *  graphicsInfo complet 1:1.
 *
 *  subspriteTables/anims/affineAnims = null pour l'instant (= ports différés
 *  vers structs séparées). Pas critique pour le spawn de base — utilisés par
 *  des hooks (StartSpriteAnim, SetSubspriteTables) qui peuvent rester côté
 *  port existant en attendant.
 */
export function build_gObjectEventGraphicsInfo_Mom(
  gObjectEventPic_Mom: Uint8Array,
): ObjectEventGraphicsInfo {
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
    subspriteTables: null,   // port différé : sOamTables_16x32
    anims: null,             // port différé : sAnimTable_Standard
    images: build_sPicTable_Mom(gObjectEventPic_Mom),
    affineAnims: null,       // port différé : gDummySpriteAffineAnimTable
  };
}

// ─── MakeSpriteTemplateFromObjectEventTemplate 1:1 décomp ─────────────────
/**
 *  1:1 décomp `MakeSpriteTemplateFromObjectEventTemplate` (event_object_
 *  movement.c:1562-1565) :
 *
 *  static void MakeSpriteTemplateFromObjectEventTemplate(
 *      const struct ObjectEventTemplate *objectEventTemplate,
 *      struct SpriteTemplate *spriteTemplate,
 *      const struct SubspriteTable **subspriteTables)
 *  {
 *      CopyObjectGraphicsInfoToSpriteTemplate_WithMovementType(
 *          objectEventTemplate->graphicsId,
 *          objectEventTemplate->movementType,
 *          spriteTemplate,
 *          subspriteTables);
 *  }
 *
 *  Et `CopyObjectGraphicsInfoToSpriteTemplate_WithMovementType` (l.1557-1560) :
 *      CopyObjectGraphicsInfoToSpriteTemplate(graphicsId,
 *          sMovementTypeCallbacks[movementType], spriteTemplate, subspriteTables);
 *
 *  Et `CopyObjectGraphicsInfoToSpriteTemplate` (l.1543-1555) :
 *      graphicsInfo = GetObjectEventGraphicsInfo(graphicsId);
 *      spriteTemplate->tileTag = graphicsInfo->tileTag;
 *      spriteTemplate->paletteTag = graphicsInfo->paletteTag;
 *      spriteTemplate->oam = graphicsInfo->oam;
 *      spriteTemplate->anims = graphicsInfo->anims;
 *      spriteTemplate->images = graphicsInfo->images;
 *      spriteTemplate->affineAnims = graphicsInfo->affineAnims;
 *      spriteTemplate->callback = callback;
 *      *subspriteTables = graphicsInfo->subspriteTables;
 *
 *  Notre port collapse les 3 fns en une seule pour simplicité, mais le flow
 *  reste 1:1 :
 *    - lookup graphicsInfo via graphicsId
 *    - copy fields graphicsInfo → spriteTemplate
 *    - return subspriteTables
 */
export function MakeSpriteTemplateFromObjectEventTemplate(
  graphicsInfo: ObjectEventGraphicsInfo,
  callback: ((spriteId: number) => void) | null,
): { spriteTemplate: SpriteTemplate; subspriteTables: unknown[] | null } {
  const spriteTemplate: SpriteTemplate = {
    tileTag: graphicsInfo.tileTag,
    paletteTag: graphicsInfo.paletteTag,
    oam: graphicsInfo.oam,
    anims: graphicsInfo.anims,
    images: graphicsInfo.images,
    affineAnims: graphicsInfo.affineAnims,
    callback,
  };
  return { spriteTemplate, subspriteTables: graphicsInfo.subspriteTables };
}
