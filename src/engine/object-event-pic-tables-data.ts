/**
 * object-event-pic-tables-data.ts - Port 1:1 STRICT decomp.
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/data/object_events/object_event_pic_tables.h (2174 lignes)
 *
 * Auto-port (219 sPicTable_*) - factory functions qui prennent le buffer 4bpp
 * PNG-loaded et retournent un SpriteFrameImage[]. Chaque entry slice le buffer
 * par frame, sans copy (= subarray views).
 *
 * Macros resolus :
 *   overworld_frame(ptr, w, h, frame) = { data: ptr + (w*h*32)*frame, size: w*h*32 }
 *   obj_frame_tiles(ptr)              = { data: ptr, size: ptr.length }
 *
 * Cas speciaux : plusieurs tables referent a PLUSIEURS buffers PIC distincts
 * (ex. sPicTable_BrendanNormal = BrendanNormal + BrendanRunning concatenes).
 * Ces tables prennent N arguments Uint8Array dans l'ordre d'apparition C.
 */
import type { SpriteFrameImage } from './sprite-animation';

/** 1:1 decomp `sPicTable_BrendanNormal` (object_event_pic_tables.h:1-20). */
export function build_sPicTable_BrendanNormal(brendanNormalPic: Uint8Array, brendanRunningPic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: brendanNormalPic.subarray(0, 256), size: 256 },
    { data: brendanNormalPic.subarray(256, 512), size: 256 },
    { data: brendanNormalPic.subarray(512, 768), size: 256 },
    { data: brendanNormalPic.subarray(768, 1024), size: 256 },
    { data: brendanNormalPic.subarray(1024, 1280), size: 256 },
    { data: brendanNormalPic.subarray(1280, 1536), size: 256 },
    { data: brendanNormalPic.subarray(1536, 1792), size: 256 },
    { data: brendanNormalPic.subarray(1792, 2048), size: 256 },
    { data: brendanNormalPic.subarray(2048, 2304), size: 256 },
    { data: brendanRunningPic.subarray(0, 256), size: 256 },
    { data: brendanRunningPic.subarray(256, 512), size: 256 },
    { data: brendanRunningPic.subarray(512, 768), size: 256 },
    { data: brendanRunningPic.subarray(768, 1024), size: 256 },
    { data: brendanRunningPic.subarray(1024, 1280), size: 256 },
    { data: brendanRunningPic.subarray(1280, 1536), size: 256 },
    { data: brendanRunningPic.subarray(1536, 1792), size: 256 },
    { data: brendanRunningPic.subarray(1792, 2048), size: 256 },
    { data: brendanRunningPic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanMachBike` (object_event_pic_tables.h:22-32). */
export function build_sPicTable_BrendanMachBike(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanAcroBike` (object_event_pic_tables.h:34-62). */
export function build_sPicTable_BrendanAcroBike(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
    { data: pic.subarray(4608, 5120), size: 512 },
    { data: pic.subarray(5120, 5632), size: 512 },
    { data: pic.subarray(5632, 6144), size: 512 },
    { data: pic.subarray(6144, 6656), size: 512 },
    { data: pic.subarray(6656, 7168), size: 512 },
    { data: pic.subarray(7168, 7680), size: 512 },
    { data: pic.subarray(7680, 8192), size: 512 },
    { data: pic.subarray(8192, 8704), size: 512 },
    { data: pic.subarray(8704, 9216), size: 512 },
    { data: pic.subarray(9216, 9728), size: 512 },
    { data: pic.subarray(9728, 10240), size: 512 },
    { data: pic.subarray(10240, 10752), size: 512 },
    { data: pic.subarray(10752, 11264), size: 512 },
    { data: pic.subarray(11264, 11776), size: 512 },
    { data: pic.subarray(11776, 12288), size: 512 },
    { data: pic.subarray(12288, 12800), size: 512 },
    { data: pic.subarray(12800, 13312), size: 512 },
    { data: pic.subarray(13312, 13824), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanSurfing` (object_event_pic_tables.h:64-77). */
export function build_sPicTable_BrendanSurfing(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanUnderwater` (object_event_pic_tables.h:79-89). */
export function build_sPicTable_BrendanUnderwater(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanFieldMove` (object_event_pic_tables.h:91-97). */
export function build_sPicTable_BrendanFieldMove(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_QuintyPlump` (object_event_pic_tables.h:99-107). */
export function build_sPicTable_QuintyPlump(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_NinjaBoy` (object_event_pic_tables.h:109-119). */
export function build_sPicTable_NinjaBoy(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Twin` (object_event_pic_tables.h:121-131). */
export function build_sPicTable_Twin(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Boy1` (object_event_pic_tables.h:133-143). */
export function build_sPicTable_Boy1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Girl1` (object_event_pic_tables.h:145-155). */
export function build_sPicTable_Girl1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Boy2` (object_event_pic_tables.h:157-167). */
export function build_sPicTable_Boy2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Girl2` (object_event_pic_tables.h:169-179). */
export function build_sPicTable_Girl2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_LittleBoy` (object_event_pic_tables.h:181-191). */
export function build_sPicTable_LittleBoy(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_LittleGirl` (object_event_pic_tables.h:193-203). */
export function build_sPicTable_LittleGirl(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Boy3` (object_event_pic_tables.h:205-215). */
export function build_sPicTable_Boy3(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Girl3` (object_event_pic_tables.h:217-227). */
export function build_sPicTable_Girl3(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RichBoy` (object_event_pic_tables.h:229-239). */
export function build_sPicTable_RichBoy(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Woman1` (object_event_pic_tables.h:241-251). */
export function build_sPicTable_Woman1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_FatMan` (object_event_pic_tables.h:253-263). */
export function build_sPicTable_FatMan(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_PokefanF` (object_event_pic_tables.h:265-275). */
export function build_sPicTable_PokefanF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Man1` (object_event_pic_tables.h:277-287). */
export function build_sPicTable_Man1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Woman2` (object_event_pic_tables.h:289-299). */
export function build_sPicTable_Woman2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ExpertM` (object_event_pic_tables.h:301-311). */
export function build_sPicTable_ExpertM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ExpertF` (object_event_pic_tables.h:313-323). */
export function build_sPicTable_ExpertF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Man2` (object_event_pic_tables.h:325-335). */
export function build_sPicTable_Man2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Woman3` (object_event_pic_tables.h:337-347). */
export function build_sPicTable_Woman3(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_PokefanM` (object_event_pic_tables.h:349-359). */
export function build_sPicTable_PokefanM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Woman4` (object_event_pic_tables.h:361-371). */
export function build_sPicTable_Woman4(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Cook` (object_event_pic_tables.h:373-383). */
export function build_sPicTable_Cook(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_LinkReceptionist` (object_event_pic_tables.h:385-395). */
export function build_sPicTable_LinkReceptionist(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_OldMan` (object_event_pic_tables.h:397-407). */
export function build_sPicTable_OldMan(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_OldWoman` (object_event_pic_tables.h:409-419). */
export function build_sPicTable_OldWoman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Camper` (object_event_pic_tables.h:421-431). */
export function build_sPicTable_Camper(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Picnicker` (object_event_pic_tables.h:433-443). */
export function build_sPicTable_Picnicker(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Man3` (object_event_pic_tables.h:445-455). */
export function build_sPicTable_Man3(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Woman5` (object_event_pic_tables.h:457-467). */
export function build_sPicTable_Woman5(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Youngster` (object_event_pic_tables.h:469-479). */
export function build_sPicTable_Youngster(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_BugCatcher` (object_event_pic_tables.h:481-491). */
export function build_sPicTable_BugCatcher(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_PsychicM` (object_event_pic_tables.h:493-503). */
export function build_sPicTable_PsychicM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_SchoolKidM` (object_event_pic_tables.h:505-515). */
export function build_sPicTable_SchoolKidM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Maniac` (object_event_pic_tables.h:517-527). */
export function build_sPicTable_Maniac(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_HexManiac` (object_event_pic_tables.h:529-539). */
export function build_sPicTable_HexManiac(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_SwimmerM` (object_event_pic_tables.h:541-551). */
export function build_sPicTable_SwimmerM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_SwimmerF` (object_event_pic_tables.h:553-563). */
export function build_sPicTable_SwimmerF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_BlackBelt` (object_event_pic_tables.h:565-575). */
export function build_sPicTable_BlackBelt(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Beauty` (object_event_pic_tables.h:577-587). */
export function build_sPicTable_Beauty(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Scientist1` (object_event_pic_tables.h:589-599). */
export function build_sPicTable_Scientist1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Lass` (object_event_pic_tables.h:601-611). */
export function build_sPicTable_Lass(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Gentleman` (object_event_pic_tables.h:613-623). */
export function build_sPicTable_Gentleman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Sailor` (object_event_pic_tables.h:625-635). */
export function build_sPicTable_Sailor(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Fisherman` (object_event_pic_tables.h:637-647). */
export function build_sPicTable_Fisherman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RunningTriathleteM` (object_event_pic_tables.h:649-659). */
export function build_sPicTable_RunningTriathleteM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RunningTriathleteF` (object_event_pic_tables.h:661-671). */
export function build_sPicTable_RunningTriathleteF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_TuberF` (object_event_pic_tables.h:673-683). */
export function build_sPicTable_TuberF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_TuberM` (object_event_pic_tables.h:685-695). */
export function build_sPicTable_TuberM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Hiker` (object_event_pic_tables.h:697-707). */
export function build_sPicTable_Hiker(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_CyclingTriathleteM` (object_event_pic_tables.h:709-719). */
export function build_sPicTable_CyclingTriathleteM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_CyclingTriathleteF` (object_event_pic_tables.h:721-731). */
export function build_sPicTable_CyclingTriathleteF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Nurse` (object_event_pic_tables.h:733-744). */
export function build_sPicTable_Nurse(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ItemBall` (object_event_pic_tables.h:746-748). */
export function build_sPicTable_ItemBall(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_ProfBirch` (object_event_pic_tables.h:750-760). */
export function build_sPicTable_ProfBirch(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Man4` (object_event_pic_tables.h:762-772). */
export function build_sPicTable_Man4(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Man5` (object_event_pic_tables.h:774-784). */
export function build_sPicTable_Man5(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ReporterM` (object_event_pic_tables.h:786-796). */
export function build_sPicTable_ReporterM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ReporterF` (object_event_pic_tables.h:798-808). */
export function build_sPicTable_ReporterF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MauvilleOldMan1` (object_event_pic_tables.h:810-820). */
export function build_sPicTable_MauvilleOldMan1(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MauvilleOldMan2` (object_event_pic_tables.h:822-832). */
export function build_sPicTable_MauvilleOldMan2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_UnusedNatuDoll` (object_event_pic_tables.h:834-836). */
export function build_sPicTable_UnusedNatuDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_UnusedMagnemiteDoll` (object_event_pic_tables.h:838-840). */
export function build_sPicTable_UnusedMagnemiteDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_UnusedSquirtleDoll` (object_event_pic_tables.h:842-844). */
export function build_sPicTable_UnusedSquirtleDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_UnusedWooperDoll` (object_event_pic_tables.h:846-848). */
export function build_sPicTable_UnusedWooperDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_UnusedPikachuDoll` (object_event_pic_tables.h:850-852). */
export function build_sPicTable_UnusedPikachuDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_UnusedPorygon2Doll` (object_event_pic_tables.h:854-856). */
export function build_sPicTable_UnusedPorygon2Doll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_CuttableTree` (object_event_pic_tables.h:858-863). */
export function build_sPicTable_CuttableTree(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_MartEmployee` (object_event_pic_tables.h:865-875). */
export function build_sPicTable_MartEmployee(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RooftopSaleWoman` (object_event_pic_tables.h:877-887). */
export function build_sPicTable_RooftopSaleWoman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Teala` (object_event_pic_tables.h:889-899). */
export function build_sPicTable_Teala(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_BreakableRock` (object_event_pic_tables.h:901-906). */
export function build_sPicTable_BreakableRock(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_PushableBoulder` (object_event_pic_tables.h:908-910). */
export function build_sPicTable_PushableBoulder(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_MrBrineysBoat` (object_event_pic_tables.h:912-922). */
export function build_sPicTable_MrBrineysBoat(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Truck` (object_event_pic_tables.h:924-926). */
export function build_sPicTable_Truck(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_VigorothCarryingBox` (object_event_pic_tables.h:928-938). */
export function build_sPicTable_VigorothCarryingBox(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_VigorothFacingAway` (object_event_pic_tables.h:940-950). */
export function build_sPicTable_VigorothFacingAway(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BirchsBag` (object_event_pic_tables.h:952-954). */
export function build_sPicTable_BirchsBag(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_EnemyZigzagoon` (object_event_pic_tables.h:956-966). */
export function build_sPicTable_EnemyZigzagoon(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Poochyena` (object_event_pic_tables.h:968-978). */
export function build_sPicTable_Poochyena(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Artist` (object_event_pic_tables.h:980-990). */
export function build_sPicTable_Artist(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MayNormal` (object_event_pic_tables.h:992-1011). */
export function build_sPicTable_MayNormal(mayNormalPic: Uint8Array, mayRunningPic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: mayNormalPic.subarray(0, 256), size: 256 },
    { data: mayNormalPic.subarray(256, 512), size: 256 },
    { data: mayNormalPic.subarray(512, 768), size: 256 },
    { data: mayNormalPic.subarray(768, 1024), size: 256 },
    { data: mayNormalPic.subarray(1024, 1280), size: 256 },
    { data: mayNormalPic.subarray(1280, 1536), size: 256 },
    { data: mayNormalPic.subarray(1536, 1792), size: 256 },
    { data: mayNormalPic.subarray(1792, 2048), size: 256 },
    { data: mayNormalPic.subarray(2048, 2304), size: 256 },
    { data: mayRunningPic.subarray(0, 256), size: 256 },
    { data: mayRunningPic.subarray(256, 512), size: 256 },
    { data: mayRunningPic.subarray(512, 768), size: 256 },
    { data: mayRunningPic.subarray(768, 1024), size: 256 },
    { data: mayRunningPic.subarray(1024, 1280), size: 256 },
    { data: mayRunningPic.subarray(1280, 1536), size: 256 },
    { data: mayRunningPic.subarray(1536, 1792), size: 256 },
    { data: mayRunningPic.subarray(1792, 2048), size: 256 },
    { data: mayRunningPic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MayMachBike` (object_event_pic_tables.h:1013-1023). */
export function build_sPicTable_MayMachBike(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MayAcroBike` (object_event_pic_tables.h:1025-1053). */
export function build_sPicTable_MayAcroBike(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
    { data: pic.subarray(4608, 5120), size: 512 },
    { data: pic.subarray(5120, 5632), size: 512 },
    { data: pic.subarray(5632, 6144), size: 512 },
    { data: pic.subarray(6144, 6656), size: 512 },
    { data: pic.subarray(6656, 7168), size: 512 },
    { data: pic.subarray(7168, 7680), size: 512 },
    { data: pic.subarray(7680, 8192), size: 512 },
    { data: pic.subarray(8192, 8704), size: 512 },
    { data: pic.subarray(8704, 9216), size: 512 },
    { data: pic.subarray(9216, 9728), size: 512 },
    { data: pic.subarray(9728, 10240), size: 512 },
    { data: pic.subarray(10240, 10752), size: 512 },
    { data: pic.subarray(10752, 11264), size: 512 },
    { data: pic.subarray(11264, 11776), size: 512 },
    { data: pic.subarray(11776, 12288), size: 512 },
    { data: pic.subarray(12288, 12800), size: 512 },
    { data: pic.subarray(12800, 13312), size: 512 },
    { data: pic.subarray(13312, 13824), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MaySurfing` (object_event_pic_tables.h:1055-1068). */
export function build_sPicTable_MaySurfing(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MayUnderwater` (object_event_pic_tables.h:1070-1080). */
export function build_sPicTable_MayUnderwater(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MayFieldMove` (object_event_pic_tables.h:1082-1088). */
export function build_sPicTable_MayFieldMove(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Cameraman` (object_event_pic_tables.h:1090-1100). */
export function build_sPicTable_Cameraman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MovingBox` (object_event_pic_tables.h:1102-1104). */
export function build_sPicTable_MovingBox(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_CableCar` (object_event_pic_tables.h:1106-1108). */
export function build_sPicTable_CableCar(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Scientist2` (object_event_pic_tables.h:1110-1120). */
export function build_sPicTable_Scientist2(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_DevonEmployee` (object_event_pic_tables.h:1122-1132). */
export function build_sPicTable_DevonEmployee(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_AquaMemberM` (object_event_pic_tables.h:1134-1144). */
export function build_sPicTable_AquaMemberM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_AquaMemberF` (object_event_pic_tables.h:1146-1156). */
export function build_sPicTable_AquaMemberF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MagmaMemberM` (object_event_pic_tables.h:1158-1168). */
export function build_sPicTable_MagmaMemberM(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MagmaMemberF` (object_event_pic_tables.h:1170-1180). */
export function build_sPicTable_MagmaMemberF(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Sidney` (object_event_pic_tables.h:1182-1192). */
export function build_sPicTable_Sidney(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Phoebe` (object_event_pic_tables.h:1194-1204). */
export function build_sPicTable_Phoebe(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Glacia` (object_event_pic_tables.h:1206-1216). */
export function build_sPicTable_Glacia(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Drake` (object_event_pic_tables.h:1218-1228). */
export function build_sPicTable_Drake(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Roxanne` (object_event_pic_tables.h:1230-1240). */
export function build_sPicTable_Roxanne(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Brawly` (object_event_pic_tables.h:1242-1252). */
export function build_sPicTable_Brawly(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Wattson` (object_event_pic_tables.h:1254-1264). */
export function build_sPicTable_Wattson(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Flannery` (object_event_pic_tables.h:1266-1276). */
export function build_sPicTable_Flannery(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Norman` (object_event_pic_tables.h:1278-1288). */
export function build_sPicTable_Norman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Winona` (object_event_pic_tables.h:1290-1300). */
export function build_sPicTable_Winona(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Liza` (object_event_pic_tables.h:1302-1312). */
export function build_sPicTable_Liza(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Tate` (object_event_pic_tables.h:1314-1324). */
export function build_sPicTable_Tate(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Wallace` (object_event_pic_tables.h:1326-1336). */
export function build_sPicTable_Wallace(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Steven` (object_event_pic_tables.h:1338-1348). */
export function build_sPicTable_Steven(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Wally` (object_event_pic_tables.h:1350-1360). */
export function build_sPicTable_Wally(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RubySapphireLittleBoy` (object_event_pic_tables.h:1362-1372). */
export function build_sPicTable_RubySapphireLittleBoy(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanFishing` (object_event_pic_tables.h:1374-1387). */
export function build_sPicTable_BrendanFishing(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
    { data: pic.subarray(4608, 5120), size: 512 },
    { data: pic.subarray(5120, 5632), size: 512 },
    { data: pic.subarray(5632, 6144), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MayFishing` (object_event_pic_tables.h:1389-1402). */
export function build_sPicTable_MayFishing(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(3072, 3584), size: 512 },
    { data: pic.subarray(3584, 4096), size: 512 },
    { data: pic.subarray(4096, 4608), size: 512 },
    { data: pic.subarray(4608, 5120), size: 512 },
    { data: pic.subarray(5120, 5632), size: 512 },
    { data: pic.subarray(5632, 6144), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_HotSpringsOldWoman` (object_event_pic_tables.h:1404-1414). */
export function build_sPicTable_HotSpringsOldWoman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_SSTidal` (object_event_pic_tables.h:1416-1426). */
export function build_sPicTable_SSTidal(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SubmarineShadow` (object_event_pic_tables.h:1428-1438). */
export function build_sPicTable_SubmarineShadow(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_PichuDoll` (object_event_pic_tables.h:1440-1442). */
export function build_sPicTable_PichuDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_PikachuDoll` (object_event_pic_tables.h:1444-1446). */
export function build_sPicTable_PikachuDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_MarillDoll` (object_event_pic_tables.h:1448-1450). */
export function build_sPicTable_MarillDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_TogepiDoll` (object_event_pic_tables.h:1452-1454). */
export function build_sPicTable_TogepiDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_CyndaquilDoll` (object_event_pic_tables.h:1456-1458). */
export function build_sPicTable_CyndaquilDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_ChikoritaDoll` (object_event_pic_tables.h:1460-1462). */
export function build_sPicTable_ChikoritaDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_TotodileDoll` (object_event_pic_tables.h:1464-1466). */
export function build_sPicTable_TotodileDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_JigglypuffDoll` (object_event_pic_tables.h:1468-1470). */
export function build_sPicTable_JigglypuffDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_MeowthDoll` (object_event_pic_tables.h:1472-1474). */
export function build_sPicTable_MeowthDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_ClefairyDoll` (object_event_pic_tables.h:1476-1478). */
export function build_sPicTable_ClefairyDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_DittoDoll` (object_event_pic_tables.h:1480-1482). */
export function build_sPicTable_DittoDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SmoochumDoll` (object_event_pic_tables.h:1484-1486). */
export function build_sPicTable_SmoochumDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_TreeckoDoll` (object_event_pic_tables.h:1488-1490). */
export function build_sPicTable_TreeckoDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_TorchicDoll` (object_event_pic_tables.h:1492-1494). */
export function build_sPicTable_TorchicDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_MudkipDoll` (object_event_pic_tables.h:1496-1498). */
export function build_sPicTable_MudkipDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_DuskullDoll` (object_event_pic_tables.h:1500-1502). */
export function build_sPicTable_DuskullDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_WynautDoll` (object_event_pic_tables.h:1504-1506). */
export function build_sPicTable_WynautDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BaltoyDoll` (object_event_pic_tables.h:1508-1510). */
export function build_sPicTable_BaltoyDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_KecleonDoll` (object_event_pic_tables.h:1512-1514). */
export function build_sPicTable_KecleonDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_AzurillDoll` (object_event_pic_tables.h:1516-1518). */
export function build_sPicTable_AzurillDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SkittyDoll` (object_event_pic_tables.h:1520-1522). */
export function build_sPicTable_SkittyDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SwabluDoll` (object_event_pic_tables.h:1524-1526). */
export function build_sPicTable_SwabluDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_GulpinDoll` (object_event_pic_tables.h:1528-1530). */
export function build_sPicTable_GulpinDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_LotadDoll` (object_event_pic_tables.h:1532-1534). */
export function build_sPicTable_LotadDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SeedotDoll` (object_event_pic_tables.h:1536-1538). */
export function build_sPicTable_SeedotDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_PikaCushion` (object_event_pic_tables.h:1540-1542). */
export function build_sPicTable_PikaCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_RoundCushion` (object_event_pic_tables.h:1544-1546). */
export function build_sPicTable_RoundCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_KissCushion` (object_event_pic_tables.h:1548-1550). */
export function build_sPicTable_KissCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_ZigzagCushion` (object_event_pic_tables.h:1552-1554). */
export function build_sPicTable_ZigzagCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_SpinCushion` (object_event_pic_tables.h:1556-1558). */
export function build_sPicTable_SpinCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_DiamondCushion` (object_event_pic_tables.h:1560-1562). */
export function build_sPicTable_DiamondCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BallCushion` (object_event_pic_tables.h:1564-1566). */
export function build_sPicTable_BallCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_GrassCushion` (object_event_pic_tables.h:1568-1570). */
export function build_sPicTable_GrassCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_FireCushion` (object_event_pic_tables.h:1572-1574). */
export function build_sPicTable_FireCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_WaterCushion` (object_event_pic_tables.h:1576-1578). */
export function build_sPicTable_WaterCushion(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigSnorlaxDoll` (object_event_pic_tables.h:1580-1582). */
export function build_sPicTable_BigSnorlaxDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigRhydonDoll` (object_event_pic_tables.h:1584-1586). */
export function build_sPicTable_BigRhydonDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigLaprasDoll` (object_event_pic_tables.h:1588-1590). */
export function build_sPicTable_BigLaprasDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigVenusaurDoll` (object_event_pic_tables.h:1592-1594). */
export function build_sPicTable_BigVenusaurDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigCharizardDoll` (object_event_pic_tables.h:1596-1598). */
export function build_sPicTable_BigCharizardDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigBlastoiseDoll` (object_event_pic_tables.h:1600-1602). */
export function build_sPicTable_BigBlastoiseDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigWailmerDoll` (object_event_pic_tables.h:1604-1606). */
export function build_sPicTable_BigWailmerDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigRegirockDoll` (object_event_pic_tables.h:1608-1610). */
export function build_sPicTable_BigRegirockDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigRegiceDoll` (object_event_pic_tables.h:1612-1614). */
export function build_sPicTable_BigRegiceDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_BigRegisteelDoll` (object_event_pic_tables.h:1616-1618). */
export function build_sPicTable_BigRegisteelDoll(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_LatiasLatios` (object_event_pic_tables.h:1620-1630). */
export function build_sPicTable_LatiasLatios(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_GameboyKid` (object_event_pic_tables.h:1632-1642). */
export function build_sPicTable_GameboyKid(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_ContestJudge` (object_event_pic_tables.h:1644-1654). */
export function build_sPicTable_ContestJudge(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanWatering` (object_event_pic_tables.h:1656-1666). */
export function build_sPicTable_BrendanWatering(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_MayWatering` (object_event_pic_tables.h:1668-1678). */
export function build_sPicTable_MayWatering(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(2048, 2560), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
    { data: pic.subarray(2560, 3072), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BrendanDecorating` (object_event_pic_tables.h:1680-1682). */
export function build_sPicTable_BrendanDecorating(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_MayDecorating` (object_event_pic_tables.h:1684-1686). */
export function build_sPicTable_MayDecorating(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Archie` (object_event_pic_tables.h:1688-1698). */
export function build_sPicTable_Archie(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Maxie` (object_event_pic_tables.h:1700-1710). */
export function build_sPicTable_Maxie(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_KyogreFront` (object_event_pic_tables.h:1712-1722). */
export function build_sPicTable_KyogreFront(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_GroudonFront` (object_event_pic_tables.h:1724-1734). */
export function build_sPicTable_GroudonFront(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_KyogreSide` (object_event_pic_tables.h:1736-1746). */
export function build_sPicTable_KyogreSide(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_GroudonSide` (object_event_pic_tables.h:1748-1758). */
export function build_sPicTable_GroudonSide(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1024, 1536), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
    { data: pic.subarray(1536, 2048), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_Fossil` (object_event_pic_tables.h:1760-1762). */
export function build_sPicTable_Fossil(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Regi` (object_event_pic_tables.h:1764-1774). */
export function build_sPicTable_Regi(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Skitty` (object_event_pic_tables.h:1776-1786). */
export function build_sPicTable_Skitty(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Kecleon` (object_event_pic_tables.h:1788-1798). */
export function build_sPicTable_Kecleon(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Rayquaza` (object_event_pic_tables.h:1800-1806). */
export function build_sPicTable_Rayquaza(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 2048), size: 2048 },
    { data: pic.subarray(2048, 4096), size: 2048 },
    { data: pic.subarray(4096, 6144), size: 2048 },
    { data: pic.subarray(6144, 8192), size: 2048 },
    { data: pic.subarray(8192, 10240), size: 2048 },
  ];
}

/** 1:1 decomp `sPicTable_RayquazaStill` (object_event_pic_tables.h:1808-1818). */
export function build_sPicTable_RayquazaStill(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Zigzagoon` (object_event_pic_tables.h:1820-1830). */
export function build_sPicTable_Zigzagoon(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Pikachu` (object_event_pic_tables.h:1832-1842). */
export function build_sPicTable_Pikachu(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Azumarill` (object_event_pic_tables.h:1844-1854). */
export function build_sPicTable_Azumarill(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Wingull` (object_event_pic_tables.h:1856-1866). */
export function build_sPicTable_Wingull(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_TuberMSwimming` (object_event_pic_tables.h:1868-1878). */
export function build_sPicTable_TuberMSwimming(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(384, 512), size: 128 },
    { data: pic.subarray(512, 640), size: 128 },
    { data: pic.subarray(640, 768), size: 128 },
    { data: pic.subarray(768, 896), size: 128 },
    { data: pic.subarray(896, 1024), size: 128 },
    { data: pic.subarray(1024, 1152), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Azurill` (object_event_pic_tables.h:1880-1890). */
export function build_sPicTable_Azurill(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(0, 128), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(128, 256), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
    { data: pic.subarray(256, 384), size: 128 },
  ];
}

/** 1:1 decomp `sPicTable_Mom` (object_event_pic_tables.h:1892-1902). */
export function build_sPicTable_Mom(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Scott` (object_event_pic_tables.h:1904-1914). */
export function build_sPicTable_Scott(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Juan` (object_event_pic_tables.h:1916-1926). */
export function build_sPicTable_Juan(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_MysteryEventDeliveryman` (object_event_pic_tables.h:1928-1938). */
export function build_sPicTable_MysteryEventDeliveryman(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Statue` (object_event_pic_tables.h:1940-1942). */
export function build_sPicTable_Statue(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Dusclops` (object_event_pic_tables.h:1944-1954). */
export function build_sPicTable_Dusclops(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Kirlia` (object_event_pic_tables.h:1956-1966). */
export function build_sPicTable_Kirlia(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_UnionRoomAttendant` (object_event_pic_tables.h:1968-1978). */
export function build_sPicTable_UnionRoomAttendant(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Sudowoodo` (object_event_pic_tables.h:1980-1990). */
export function build_sPicTable_Sudowoodo(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Mew` (object_event_pic_tables.h:1992-2002). */
export function build_sPicTable_Mew(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Red` (object_event_pic_tables.h:2004-2014). */
export function build_sPicTable_Red(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Leaf` (object_event_pic_tables.h:2016-2026). */
export function build_sPicTable_Leaf(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Deoxys` (object_event_pic_tables.h:2028-2038). */
export function build_sPicTable_Deoxys(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_BirthIslandStone` (object_event_pic_tables.h:2040-2042). */
export function build_sPicTable_BirthIslandStone(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic, size: pic.length },
  ];
}

/** 1:1 decomp `sPicTable_Anabel` (object_event_pic_tables.h:2044-2054). */
export function build_sPicTable_Anabel(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Tucker` (object_event_pic_tables.h:2056-2066). */
export function build_sPicTable_Tucker(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Spenser` (object_event_pic_tables.h:2068-2078). */
export function build_sPicTable_Spenser(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Greta` (object_event_pic_tables.h:2080-2090). */
export function build_sPicTable_Greta(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Noland` (object_event_pic_tables.h:2092-2102). */
export function build_sPicTable_Noland(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Lucy` (object_event_pic_tables.h:2104-2114). */
export function build_sPicTable_Lucy(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Brandon` (object_event_pic_tables.h:2116-2126). */
export function build_sPicTable_Brandon(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_Lugia` (object_event_pic_tables.h:2128-2138). */
export function build_sPicTable_Lugia(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_HoOh` (object_event_pic_tables.h:2140-2150). */
export function build_sPicTable_HoOh(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
    { data: pic.subarray(0, 512), size: 512 },
    { data: pic.subarray(512, 1024), size: 512 },
  ];
}

/** 1:1 decomp `sPicTable_RubySapphireBrendan` (object_event_pic_tables.h:2152-2162). */
export function build_sPicTable_RubySapphireBrendan(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}

/** 1:1 decomp `sPicTable_RubySapphireMay` (object_event_pic_tables.h:2164-2174). */
export function build_sPicTable_RubySapphireMay(pic: Uint8Array): ReadonlyArray<SpriteFrameImage> {
  return [
    { data: pic.subarray(0, 256), size: 256 },
    { data: pic.subarray(256, 512), size: 256 },
    { data: pic.subarray(512, 768), size: 256 },
    { data: pic.subarray(768, 1024), size: 256 },
    { data: pic.subarray(1024, 1280), size: 256 },
    { data: pic.subarray(1280, 1536), size: 256 },
    { data: pic.subarray(1536, 1792), size: 256 },
    { data: pic.subarray(1792, 2048), size: 256 },
    { data: pic.subarray(2048, 2304), size: 256 },
  ];
}
