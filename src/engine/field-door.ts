/**
 * field-door.ts — Phase 4.6 1:1 décomp `src/field_door.c`.
 *
 * Manage les animations des portes (open/close) + sound effects associés.
 * Utilisé par :
 *   - `Task_DoDoorWarp` (départ) : open door → walk-up player → close door → warp
 *   - `Task_ExitDoor` (arrivée) : open door (= player visible) → walk-down player → close door
 *
 * Décomp structure :
 *   - `sDoorAnimGraphicsTable[]` : pour chaque door metatile_id, store (sound type,
 *     size, tiles, palette indices)
 *   - `sDoorOpenAnimFrames[5]` / `sDoorCloseAnimFrames[5]` : 4 frames + END
 *     (= 4 frames × 4 ticks = 16 frames total = ~0.27s)
 *   - `Task_AnimateDoor` : frame-by-frame DrawDoor (= write tiles + tilemap)
 *
 * Notre version :
 *   - Door graphics table simplifiée (= subset des doors présentes Bourg-en-Vol +
 *     houses générales). Phase 4.7 : extraire toutes les 45+ doors via script.
 *   - SE 1:1 : DOOR_SOUND_NORMAL → SE_DOOR, DOOR_SOUND_SLIDING → SE_SLIDING_DOOR,
 *     DOOR_SOUND_ARENA → SE_REPEL.
 *   - Timing 1:1 : 4 frames × 4 ticks = 16 frames per anim.
 *   - Visual rendering : TODO Phase 4.6+ (= requires VRAM tile patching +
 *     tilemap rewrite à position door). Pour MVP : SE + timing only, sans
 *     visual frame swap.
 */

import { SE_DOOR, SE_SLIDING_DOOR, SE_REPEL } from './decomp-data/auto/include/constants/songs-data';
import { MapGridGetMetatileIdAt, MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './map-loader';
import { MB_ANIMATED_DOOR } from './tilemap-loader';
import {
  METATILE_General_Door,
  METATILE_General_Door_Gym,
  METATILE_General_Door_PokeCenter,
  METATILE_General_Door_PokeMart,
  METATILE_Petalburg_Door_BirchsLab,
  METATILE_Petalburg_Door_Littleroot,
} from './decomp-data/auto/include/constants/metatile_labels-data';

// ─── Sound types 1:1 décomp ─────────────────────────────────────────────────

/** 1:1 décomp `field_door.c:11-13`. */
const DOOR_SOUND_NORMAL  = 0;
const DOOR_SOUND_SLIDING = 1;
const DOOR_SOUND_ARENA   = 2;

// ─── DoorAnimFrame structure 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `struct DoorAnimFrame` (field_door.c:24-28).
 *  - time : durée en frames du frame
 *  - offset : tile offset dans VRAM (-1 = closed door = restore original metatile,
 *    0 = anim frame 0, 0x100 = anim frame 1, etc.) */
export interface DoorAnimFrame {
  time: number;
  offset: number;  // -1 (= 0xFFFF) = closed, 0/0x100/0x200 = anim frames
}

/** 1:1 décomp `sDoorOpenAnimFrames` (field_door.c:135). */
export const sDoorOpenAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: -1 },     // frame 0 : closed (= initial)
  { time: 4, offset: 0 },      // frame 1 : opening 1
  { time: 4, offset: 0x100 },  // frame 2 : opening 2
  { time: 4, offset: 0x200 },  // frame 3 : open (full)
  { time: 0, offset: 0 },      // END marker
];

/** 1:1 décomp `sDoorCloseAnimFrames` (field_door.c:144). */
export const sDoorCloseAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: 0x200 },  // frame 0 : open (initial state)
  { time: 4, offset: 0x100 },  // frame 1 : closing 1
  { time: 4, offset: 0 },      // frame 2 : closing 2
  { time: 4, offset: -1 },     // frame 3 : closed
  { time: 0, offset: 0 },      // END marker
];

/** Total durée d'une anim porte = sum(time) = 16 frames. */
export const DOOR_ANIM_TOTAL_FRAMES = 16;

// ─── DoorGraphics table 1:1 décomp ──────────────────────────────────────────

/** 1:1 décomp `struct DoorGraphics` (field_door.c:15-22). */
export interface DoorGraphics {
  /** Metatile ID du tile fermé (= match contre MapGridGetMetatileIdAt). */
  metatileNum: number;
  /** Sound type : DOOR_SOUND_NORMAL/SLIDING/ARENA. */
  sound: number;
  /** Door size : 1 = 1-tile-wide door, 2 = 2-tile-wide (ex. Petalburg gym). */
  size: 1 | 2;
  /** Asset path pour le PNG d'anim (= TODO Phase 4.6+ pour rendu visuel).
   *  Pour MVP : just used as identifier. */
  tilesPath: string;
  /** Palette index per door tile (1:1 décomp `sDoorAnimPalettes_X` u8[8]). */
  paletteIndices: readonly number[];
}

/** 1:1 décomp `sDoorAnimGraphicsTable[]` (field_door.c:223+).
 *  Subset des doors nécessaires pour la zone Bourg-en-Vol + houses standard.
 *  Phase 4.7 : extraire les 45+ entries via script depuis le décomp.
 *
 *  Note : les `metatileNum` viennent des labels `METATILE_*_Door_*` qui sont
 *  définis dans `data/tilesets/secondary/<tileset>/metatile_labels.h`. Pour MVP,
 *  on utilise des IDs placeholder qu'on remplacera quand on extraira les
 *  vrais valeurs (= mapping label → id).
 *
 *  IDs typiques observés dans la décomp source :
 *    - General_Door = 0x21A (= secondary general tileset, metatile 0x21A)
 *    - Petalburg_Door_Littleroot = 0x269 (= littleroot tileset)
 *    - BirchsLab = 0x???
 */
export const sDoorAnimGraphicsTable: readonly DoorGraphics[] = [
  // Audit Opus §4 : metatileNum maintenant extraits 1:1 depuis
  // metatile_labels-data.ts (= source décomp). Avant : placeholders 0x21A
  // qui ne matchaient aucune vraie door → GetDoorSoundEffect retournait
  // toujours SE_DOOR fallback.

  // Houses Bourg-en-Vol (= primary tileset "petalburg" partagé Bourg-en-Vol /
  // Oldale / etc., secondary "littleroot" / "birchs_lab" pour les variantes).
  {
    metatileNum: METATILE_Petalburg_Door_Littleroot,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/littleroot.png',
    paletteIndices: [10, 10, 6, 6, 6, 6, 6, 6],
  },
  {
    metatileNum: METATILE_Petalburg_Door_BirchsLab,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/birchs_lab.png',
    paletteIndices: [8, 8, 8, 8, 8, 8, 8, 8],
  },
  // Generic indoor doors (= utilisés partout : house générique,
  // pokecenter, mart, gym).
  {
    metatileNum: METATILE_General_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/general.png',
    paletteIndices: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    metatileNum: METATILE_General_Door_PokeCenter,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/poke_center.png',
    paletteIndices: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    metatileNum: METATILE_General_Door_Gym,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/gym.png',
    paletteIndices: [5, 5, 5, 5, 5, 5, 5, 5],
  },
  {
    metatileNum: METATILE_General_Door_PokeMart,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/poke_mart.png',
    paletteIndices: [0, 0, 1, 1, 1, 1, 1, 1],
  },
];

/** 1:1 décomp `GetDoorGraphics` (field_door.c:426). Lookup door table par
 *  metatile_id. */
function getDoorGraphics(metatileId: number): DoorGraphics | null {
  for (const entry of sDoorAnimGraphicsTable) {
    if (entry.metatileNum === metatileId) return entry;
  }
  return null;
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `GetDoorSoundEffect(x, y)` (field_door.c:546).
 *  @param mapX Player map coord X (= no MAP_OFFSET).
 *  @param mapY Player map coord Y.
 *  @returns SE id (SE_DOOR par défaut si door pas dans table). */
export function GetDoorSoundEffect(mapX: number, mapY: number): number {
  const metatileId = MapGridGetMetatileIdAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  const gfx = getDoorGraphics(metatileId);
  if (!gfx) return SE_DOOR;  // 1:1 décomp default fallback
  switch (gfx.sound) {
    case DOOR_SOUND_NORMAL:  return SE_DOOR;
    case DOOR_SOUND_SLIDING: return SE_SLIDING_DOOR;
    case DOOR_SOUND_ARENA:   return SE_REPEL;
    default:                 return SE_DOOR;
  }
}

/** 1:1 décomp `FieldAnimateDoorOpen(x, y)` (field_door.c:533).
 *  Démarre l'anim d'ouverture de porte à la position donnée.
 *
 *  TODO Phase 4.6+ : visual rendering (= tile patching + tilemap rewrite).
 *  Pour MVP : retourne une Promise qui resolve après DOOR_ANIM_TOTAL_FRAMES
 *  frames (= timing 1:1 décomp 16 frames). Le SE est joué par le caller via
 *  `GetDoorSoundEffect` + `PlaySE`.
 *
 *  @returns Task id équivalent (= -1 si pas une door, sinon promise).
 */
export function FieldAnimateDoorOpen(mapX: number, mapY: number): Promise<void> {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) {
    // 1:1 décomp : returns -1 si pas une door. Notre version : resolve immédiat.
    return Promise.resolve();
  }
  // TODO Phase 4.6+ : implémenter le visual frame-by-frame rendering.
  // Pour MVP : juste attendre le timing total.
  return new Promise((resolve) => {
    setTimeout(resolve, DOOR_ANIM_TOTAL_FRAMES * 17);  // ~272ms (= 16 frames @60Hz)
  });
}

/** 1:1 décomp `FieldAnimateDoorClose(x, y)` (field_door.c:525). */
export function FieldAnimateDoorClose(mapX: number, mapY: number): Promise<void> {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, DOOR_ANIM_TOTAL_FRAMES * 17);
  });
}

/** 1:1 décomp `FieldSetDoorOpened(x, y)` (field_door.c:513).
 *  Set door to fully-opened state immediately (= no anim, just final frame).
 *  Used par `Task_ExitDoor` case 0 pour que la door soit déjà ouverte au load
 *  (= player apparaît at door tile, walks down through it).
 *
 *  TODO Phase 4.6+ : implémenter visual (= draw frame[3] tiles to tilemap).
 *  MVP : no-op. */
export function FieldSetDoorOpened(_mapX: number, _mapY: number): void {
  // No-op for MVP. Phase 4.6+ : draw open door tiles to BG tilemap.
}

/** 1:1 décomp `FieldSetDoorClosed(x, y)` (field_door.c:519).
 *  Restore door to closed state (= original metatile draw). MVP : no-op. */
export function FieldSetDoorClosed(_mapX: number, _mapY: number): void {
  // No-op for MVP. Phase 4.6+ : redraw original metatile.
}
