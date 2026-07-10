/**
 * event_object_movement.ts — miroir 1:1 décomp `include/event_object_movement.h`
 * (partiel : PALSLOT_* + OBJ_EVENT_PAL_TAG_*).
 *
 * Rapatrié de `engine/field/object-event-graphics-info.ts` (unification lot 17a).
 * LEAF anti-cycle : les data/object_events (miroirs des includes TEXTUELS du .c)
 * lisent ces constantes au top-level de leurs tables → elles doivent venir d'un
 * header-miroir sans dépendance, pas de src/event_object_movement.ts (cycle ESM
 * data ↔ EOM = TDZ). src/event_object_movement.ts les ré-importe d'ici.
 */

// ─── PALSLOT_* (1:1 include/event_object_movement.h:11-26) ───────────────────
// Schéma RÉSERVÉ complet 0-11. Les object events occupent les slots OBJ fixes
// [0, OBJ_PALSLOT_COUNT) ; les slots 12-15 restent libres pour field effects /
// interface / MÉTÉO (commentaire décomp). Les NPC partagent 4 palettes
// (npc_1..4) + 4 reflets. La météo (AllocSpritePalette) alloue dans [12,16)
// grâce à gReservedSpritePaletteCount = OBJ_PALSLOT_COUNT.
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

// ─── OBJ_EVENT_PAL_TAG_* ─────────────────────────────────────────────────────
// ⚠️ Foyer décomp = `src/event_object_movement.c:435-471` (enum du .c, pas du .h).
// Hébergés ICI (header-miroir leaf) par l'adaptation anti-cycle ci-dessus ;
// src/event_object_movement.ts (le miroir du .c) les ré-exporte.
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
