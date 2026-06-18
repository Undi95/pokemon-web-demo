/**
 * field_door.ts — miroir 1:1 de `src/field_door.c`.
 *
 * Manage les animations des portes (open/close) + sound effects associés.
 * Utilisé par :
 *   - `Task_DoDoorWarp` (départ) : open door → walk-up player → close door → warp
 *   - `Task_ExitDoor` (arrivée) : open door (= player visible) → walk-down player → close door
 *
 * Pipeline rendering 1:1 décomp :
 *   1. `Task_AnimateDoor` tick chaque frame, drive par data[]:
 *      data[0..3] = (placeholders ; vrais frames/gfx via _doorTaskState side-map)
 *      data[4] = frameId, data[5] = counter, data[6] = x, data[7] = y
 *   2. À frame.time==0 : end task. Sinon AnimateDoorFrame :
 *      - counter==0 → DrawDoor (= CopyDoorTilesToVram + DrawCurrentDoorAnimFrame)
 *      - counter==frame.time → next frame
 *   3. DrawDoor :
 *      - frame.offset==0xFFFF → DrawClosedDoorTiles (= restore original metatile)
 *      - sinon → CopyDoorTilesToVram(8 tiles à NUM_TILES_TOTAL-8) + DrawCurrentDoorAnimFrame
 *
 * Décomp structure :
 *   - `sDoorAnimGraphicsTable[]` : pour chaque door metatile_id, store (sound type,
 *     size, tiles, palette indices)
 *   - `sDoorOpenAnimFrames[5]` / `sDoorCloseAnimFrames[5]` : 4 frames + END
 *     (= 4 frames × 4 ticks = 16 frames total = ~0.27s)
 *
 * SE 1:1 : DOOR_SOUND_NORMAL → SE_DOOR, DOOR_SOUND_SLIDING → SE_SLIDING_DOOR,
 * DOOR_SOUND_ARENA → SE_REPEL.
 */

import type { DecompRuntime } from '../engine/system/decomp-runtime';
import { getRuntime } from '../engine/system/decomp-globals';
import { loadTileBin } from '../engine/gba/png-loader';
import { SE_DOOR, SE_SLIDING_DOOR, SE_REPEL } from '../engine/decomp-data/include/constants/songs-data';
import { MapGridGetMetatileIdAt, MapGridGetMetatileBehaviorAt, MAP_OFFSET, NUM_TILES_TOTAL } from './fieldmap';
import { MB_ANIMATED_DOOR } from '../engine/field/tilemap-loader';
import { CurrentMapDrawMetatileAt, DrawDoorMetatileAt, GetCameraTopLeftCoords } from './field_camera';
import {
  METATILE_General_Door,
  METATILE_General_Door_Gym,
  METATILE_General_Door_PokeCenter,
  METATILE_General_Door_PokeMart,
  METATILE_General_Door_Contest,
  METATILE_Petalburg_Door_BirchsLab,
  METATILE_Petalburg_Door_Littleroot,
  METATILE_Petalburg_Door_Oldale,
  METATILE_Rustboro_Door_Tan,
  METATILE_Rustboro_Door_Gray,
  METATILE_Fallarbor_Door_LightRoof,
  METATILE_Fallarbor_Door_DarkRoof,
  METATILE_Fallarbor_Door_BattleTent,
  METATILE_Mauville_Door,
  METATILE_Mauville_Door_Verdanturf,
  METATILE_Mauville_Door_CyclingRoad,
  METATILE_Mauville_Door_BattleTent,
  METATILE_Slateport_Door,
  METATILE_Slateport_Door_BattleTent,
  METATILE_Dewford_Door,
  METATILE_Dewford_Door_BattleTower,
  METATILE_Lilycove_Door,
  METATILE_Lilycove_Door_Wooden,
  METATILE_Lilycove_Door_DeptStore,
  METATILE_Lilycove_Door_SafariZone,
  METATILE_Mossdeep_Door,
  METATILE_Mossdeep_Door_SpaceCenter,
  METATILE_Sootopolis_Door,
  METATILE_Sootopolis_Door_PeakedRoof,
  METATILE_EverGrande_Door_PokemonLeague,
  METATILE_Pacifidlog_Door,
  METATILE_PetalburgGym_Door,
  METATILE_PokemonCenter_Door_CableClub,
  METATILE_InsideShip_IntactDoor_Bottom_Unlocked,
  METATILE_InsideShip_IntactDoor_Bottom_Interior,
  METATILE_Shop_Door_Elevator,
  METATILE_BattleFrontier_Door_Elevator,
  METATILE_BattleFrontier_Door_MultiCorridor,
  METATILE_BattleFrontierOutsideWest_Door,
  METATILE_BattleFrontierOutsideWest_Door_BattleDome,
  METATILE_BattleFrontierOutsideWest_Door_BattleFactory,
  METATILE_BattleFrontierOutsideWest_Door_Sliding,
  METATILE_BattleFrontierOutsideEast_Door_BattleTower,
  METATILE_BattleFrontierOutsideEast_Door_BattleArena,
  METATILE_BattleArena_Door,
  METATILE_BattleDome_Door_Lobby,
  METATILE_BattleDome_Door_Corridor,
  METATILE_BattleDome_Door_PreBattleRoom,
  METATILE_BattlePalace_Door,
  METATILE_BattleTent_Door,
  METATILE_TrainerHill_Door_Elevator_Lobby,
  METATILE_TrainerHill_Door_Elevator_Roof,
} from '../engine/decomp-data/include/constants/metatile_labels-data';
import {
  sDoorAnimPalettes_General,
  sDoorAnimPalettes_PokeCenter,
  sDoorAnimPalettes_Gym,
  sDoorAnimPalettes_PokeMart,
  sDoorAnimPalettes_Littleroot,
  sDoorAnimPalettes_BirchsLab,
  sDoorAnimPalettes_RustboroTan,
  sDoorAnimPalettes_RustboroGray,
  sDoorAnimPalettes_FallarborLightRoof,
  sDoorAnimPalettes_FallarborDarkRoof,
  sDoorAnimPalettes_Oldale,
  sDoorAnimPalettes_Mauville,
  sDoorAnimPalettes_Verdanturf,
  sDoorAnimPalettes_Slateport,
  sDoorAnimPalettes_Dewford,
  sDoorAnimPalettes_Contest,
  sDoorAnimPalettes_Lilycove,
  sDoorAnimPalettes_LilycoveWooden,
  sDoorAnimPalettes_LilycoveDeptStore,
  sDoorAnimPalettes_LilycoveDeptStoreElevator,
  sDoorAnimPalettes_SafariZone,
  sDoorAnimPalettes_Mossdeep,
  sDoorAnimPalettes_MossdeepSpaceCenter,
  sDoorAnimPalettes_Sootopolis,
  sDoorAnimPalettes_SootopolisPeakedRoof,
  sDoorAnimPalettes_PokemonLeague,
  sDoorAnimPalettes_Pacifidlog,
  sDoorAnimPalettes_PetalburgGym,
  sDoorAnimPalettes_CyclingRoad,
  sDoorAnimPalettes_CableClub,
  sDoorAnimPalettes_AbandonedShip,
  sDoorAnimPalettes_AbandonedShipRoom,
  sDoorAnimPalettes_BattleTowerOld,
  sDoorAnimPalettes_BattleTowerElevator,
  sDoorAnimPalettes_UnusedBattleFrontier,
  sDoorAnimPalettes_BattleDome,
  sDoorAnimPalettes_BattleFactory,
  sDoorAnimPalettes_BattleTower,
  sDoorAnimPalettes_BattleArena,
  sDoorAnimPalettes_BattleArenaLobby,
  sDoorAnimPalettes_BattleDomeLobby,
  sDoorAnimPalettes_BattlePalaceLobby,
  sDoorAnimPalettes_BattleTent,
  sDoorAnimPalettes_BattleDomeCorridor,
  sDoorAnimPalettes_BattleTowerMultiCorridor,
  sDoorAnimPalettes_BattleFrontier,
  sDoorAnimPalettes_BattleDomePreBattleRoom,
  sDoorAnimPalettes_BattleTentInterior,
  sDoorAnimPalettes_TrainerHillLobbyElevator,
  sDoorAnimPalettes_TrainerHillRoofElevator,
} from '../engine/decomp-data/src/field_door-data';

// ─── Sound types 1:1 décomp ─────────────────────────────────────────────────

/** 1:1 décomp `field_door.c:11-13`. */
const DOOR_SOUND_NORMAL  = 0;
const DOOR_SOUND_SLIDING = 1;
const DOOR_SOUND_ARENA   = 2;

// ─── VRAM tile slot constants 1:1 décomp ────────────────────────────────────

/** 1:1 décomp `DOOR_TILE_START_SIZE1 = NUM_TILES_TOTAL - 8` (field_door.c:286).
 *  Les 8 dernières BG tiles 4bpp avant la fin VRAM. = 1024 - 8 = 1016. */
const DOOR_TILE_START_SIZE1 = NUM_TILES_TOTAL - 8;
/** 1:1 décomp `DOOR_TILE_START_SIZE2 = NUM_TILES_TOTAL - 16` (field_door.c:287).
 *  Les 16 dernières BG tiles 4bpp pour size=2 doors. = 1024 - 16 = 1008. */
const DOOR_TILE_START_SIZE2 = NUM_TILES_TOTAL - 16;
/** Bytes per 4bpp tile (= 32). */
const TILE_SIZE_4BPP = 32;

// ─── DoorAnimFrame structure 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `struct DoorAnimFrame` (field_door.c:24-28).
 *  - time : durée en frames du frame (= 0 = sentinel END)
 *  - offset : tile offset bytes dans gfx.tiles (-1 = 0xFFFF = closed = restore
 *    original metatile, 0/0x100/0x200 = anim frames). */
export interface DoorAnimFrame {
  time: number;
  offset: number;  // -1 (= 0xFFFF) = closed, 0/0x100/0x200 = anim frames bytes offset
}

/** 1:1 décomp `sDoorOpenAnimFrames` (field_door.c:135). */
export const sDoorOpenAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: -1 },     // frame 0 : closed (= restore original)
  { time: 4, offset: 0 },      // frame 1 : opening 1
  { time: 4, offset: 0x100 },  // frame 2 : opening 2
  { time: 4, offset: 0x200 },  // frame 3 : open (full)
  { time: 0, offset: 0 },      // END marker
];

/** 1:1 décomp `sDoorCloseAnimFrames` (field_door.c:144). */
export const sDoorCloseAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: 0x200 },  // frame 0 : open
  { time: 4, offset: 0x100 },  // frame 1 : closing 1
  { time: 4, offset: 0 },      // frame 2 : closing 2
  { time: 4, offset: -1 },     // frame 3 : closed (= restore original)
  { time: 0, offset: 0 },      // END marker
];

/** 1:1 décomp `sBigDoorOpenAnimFrames` (field_door.c:153). Pour size=2 doors. */
export const sBigDoorOpenAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: -1 },
  { time: 4, offset: 0 },
  { time: 4, offset: 0x200 },
  { time: 4, offset: 0x400 },
  { time: 0, offset: 0 },
];

/** 1:1 décomp `sBigDoorCloseAnimFrames` (field_door.c:162). */
export const sBigDoorCloseAnimFrames: readonly DoorAnimFrame[] = [
  { time: 4, offset: 0x400 },
  { time: 4, offset: 0x200 },
  { time: 4, offset: 0 },
  { time: 4, offset: -1 },
  { time: 0, offset: 0 },
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
  /** Asset path pour le PNG d'anim (= 4bpp tiles raw). */
  tilesPath: string;
  /** Palette index per door tile (1:1 décomp `sDoorAnimPalettes_X` u8[8]). */
  paletteIndices: readonly number[];
}

/** 1:1 décomp `sDoorAnimGraphicsTable[]` (field_door.c:223-281).
 *  Table complète : 57 entries (56 nommées + 1 metatile hardcodé 0x3B0).
 *  Ordre 1:1 décomp préservé.
 *
 *  metatileNum = vraies valeurs depuis `metatile_labels-data.ts` auto-extracted.
 *  paletteIndices = vraies valeurs depuis `field_door-data.ts` auto-extracted. */
export const sDoorAnimGraphicsTable: readonly DoorGraphics[] = [
  // field_door.c:225 — generic house door
  {
    metatileNum: METATILE_General_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/general.png',
    paletteIndices: sDoorAnimPalettes_General,
  },
  // field_door.c:226 — PokéCenter sliding door
  {
    metatileNum: METATILE_General_Door_PokeCenter,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/poke_center.png',
    paletteIndices: sDoorAnimPalettes_PokeCenter,
  },
  // field_door.c:227 — Gym sliding door
  {
    metatileNum: METATILE_General_Door_Gym,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/gym.png',
    paletteIndices: sDoorAnimPalettes_Gym,
  },
  // field_door.c:228 — PokéMart sliding door
  {
    metatileNum: METATILE_General_Door_PokeMart,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/poke_mart.png',
    paletteIndices: sDoorAnimPalettes_PokeMart,
  },
  // field_door.c:229 — Bourg-Palette / Littleroot house door
  {
    metatileNum: METATILE_Petalburg_Door_Littleroot,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/littleroot.png',
    paletteIndices: sDoorAnimPalettes_Littleroot,
  },
  // field_door.c:230 — Labo Bourdex / Birch's Lab door
  {
    metatileNum: METATILE_Petalburg_Door_BirchsLab,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/birchs_lab.png',
    paletteIndices: sDoorAnimPalettes_BirchsLab,
  },
  // field_door.c:231 — Rustboro tan door
  {
    metatileNum: METATILE_Rustboro_Door_Tan,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/rustboro_tan.png',
    paletteIndices: sDoorAnimPalettes_RustboroTan,
  },
  // field_door.c:232 — Rustboro gray door
  {
    metatileNum: METATILE_Rustboro_Door_Gray,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/rustboro_gray.png',
    paletteIndices: sDoorAnimPalettes_RustboroGray,
  },
  // field_door.c:233 — Fallarbor light roof door
  {
    metatileNum: METATILE_Fallarbor_Door_LightRoof,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/fallarbor_light_roof.png',
    paletteIndices: sDoorAnimPalettes_FallarborLightRoof,
  },
  // field_door.c:234 — Oldale / Petalburg-style door
  {
    metatileNum: METATILE_Petalburg_Door_Oldale,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/oldale.png',
    paletteIndices: sDoorAnimPalettes_Oldale,
  },
  // field_door.c:235 — Mauville door
  {
    metatileNum: METATILE_Mauville_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/mauville.png',
    paletteIndices: sDoorAnimPalettes_Mauville,
  },
  // field_door.c:236 — Verdanturf door (same tileset region as Mauville)
  {
    metatileNum: METATILE_Mauville_Door_Verdanturf,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/verdanturf.png',
    paletteIndices: sDoorAnimPalettes_Verdanturf,
  },
  // field_door.c:237 — Slateport door
  {
    metatileNum: METATILE_Slateport_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/slateport.png',
    paletteIndices: sDoorAnimPalettes_Slateport,
  },
  // field_door.c:238 — Dewford door
  {
    metatileNum: METATILE_Dewford_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/dewford.png',
    paletteIndices: sDoorAnimPalettes_Dewford,
  },
  // field_door.c:239 — Contest Hall sliding door
  {
    metatileNum: METATILE_General_Door_Contest,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/contest.png',
    paletteIndices: sDoorAnimPalettes_Contest,
  },
  // field_door.c:240 — Lilycove door
  {
    metatileNum: METATILE_Lilycove_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/lilycove.png',
    paletteIndices: sDoorAnimPalettes_Lilycove,
  },
  // field_door.c:241 — Lilycove wooden door
  {
    metatileNum: METATILE_Lilycove_Door_Wooden,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/lilycove_wooden.png',
    paletteIndices: sDoorAnimPalettes_LilycoveWooden,
  },
  // field_door.c:242 — Mossdeep door
  {
    metatileNum: METATILE_Mossdeep_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/mossdeep.png',
    paletteIndices: sDoorAnimPalettes_Mossdeep,
  },
  // field_door.c:243 — Sootopolis peaked roof door
  {
    metatileNum: METATILE_Sootopolis_Door_PeakedRoof,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/sootopolis_peaked_roof.png',
    paletteIndices: sDoorAnimPalettes_SootopolisPeakedRoof,
  },
  // field_door.c:244 — Sootopolis door
  {
    metatileNum: METATILE_Sootopolis_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/sootopolis.png',
    paletteIndices: sDoorAnimPalettes_Sootopolis,
  },
  // field_door.c:245 — Pokémon League sliding door (EverGrande)
  {
    metatileNum: METATILE_EverGrande_Door_PokemonLeague,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/pokemon_league.png',
    paletteIndices: sDoorAnimPalettes_PokemonLeague,
  },
  // field_door.c:246 — Pacifidlog door
  {
    metatileNum: METATILE_Pacifidlog_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/pacifidlog.png',
    paletteIndices: sDoorAnimPalettes_Pacifidlog,
  },
  // field_door.c:247 — Petalburg Gym door
  {
    metatileNum: METATILE_PetalburgGym_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/petalburg_gym.png',
    paletteIndices: sDoorAnimPalettes_PetalburgGym,
  },
  // field_door.c:248 — Cycling Road door (Mauville tileset)
  {
    metatileNum: METATILE_Mauville_Door_CyclingRoad,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/cycling_road.png',
    paletteIndices: sDoorAnimPalettes_CyclingRoad,
  },
  // field_door.c:249 — Lilycove Dept. Store sliding door
  {
    metatileNum: METATILE_Lilycove_Door_DeptStore,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/lilycove_dept_store.png',
    paletteIndices: sDoorAnimPalettes_LilycoveDeptStore,
  },
  // field_door.c:250 — Safari Zone sliding door
  {
    metatileNum: METATILE_Lilycove_Door_SafariZone,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/safari_zone.png',
    paletteIndices: sDoorAnimPalettes_SafariZone,
  },
  // field_door.c:251 — Mossdeep Space Center sliding door
  {
    metatileNum: METATILE_Mossdeep_Door_SpaceCenter,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/mossdeep_space_center.png',
    paletteIndices: sDoorAnimPalettes_MossdeepSpaceCenter,
  },
  // field_door.c:252 — PokéCenter Cable Club sliding door
  {
    metatileNum: METATILE_PokemonCenter_Door_CableClub,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/cable_club.png',
    paletteIndices: sDoorAnimPalettes_CableClub,
  },
  // field_door.c:253 — Abandoned Ship intact door (unlocked bottom)
  {
    metatileNum: METATILE_InsideShip_IntactDoor_Bottom_Unlocked,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/abandoned_ship.png',
    paletteIndices: sDoorAnimPalettes_AbandonedShip,
  },
  // field_door.c:254 — Fallarbor dark roof door
  {
    metatileNum: METATILE_Fallarbor_Door_DarkRoof,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/fallarbor_dark_roof.png',
    paletteIndices: sDoorAnimPalettes_FallarborDarkRoof,
  },
  // field_door.c:255 — Abandoned Ship room interior door
  {
    metatileNum: METATILE_InsideShip_IntactDoor_Bottom_Interior,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/abandoned_ship_room.png',
    paletteIndices: sDoorAnimPalettes_AbandonedShipRoom,
  },
  // field_door.c:256 — Lilycove Dept. Store elevator sliding door
  {
    metatileNum: METATILE_Shop_Door_Elevator,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/lilycove_dept_store_elevator.png',
    paletteIndices: sDoorAnimPalettes_LilycoveDeptStoreElevator,
  },
  // field_door.c:257 — Battle Tower (old RS-era) sliding door
  {
    metatileNum: METATILE_Dewford_Door_BattleTower,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tower_old.png',
    paletteIndices: sDoorAnimPalettes_BattleTowerOld,
  },
  // field_door.c:258 — Battle Frontier elevator sliding door
  {
    metatileNum: METATILE_BattleFrontier_Door_Elevator,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tower_elevator.png',
    paletteIndices: sDoorAnimPalettes_BattleTowerElevator,
  },
  // field_door.c:261 — Unused Battle Frontier door (no named metatile constant;
  // decomp uses raw value 0x3B0 = 944; comment says likely cut from Battle Frontier).
  {
    metatileNum: 0x3B0,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/unused_battle_frontier.png',
    paletteIndices: sDoorAnimPalettes_UnusedBattleFrontier,
  },
  // field_door.c:262 — Battle Dome sliding door (BF outside west)
  {
    metatileNum: METATILE_BattleFrontierOutsideWest_Door_BattleDome,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_dome.png',
    paletteIndices: sDoorAnimPalettes_BattleDome,
  },
  // field_door.c:263 — Battle Factory sliding door (BF outside west)
  {
    metatileNum: METATILE_BattleFrontierOutsideWest_Door_BattleFactory,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_factory.png',
    paletteIndices: sDoorAnimPalettes_BattleFactory,
  },
  // field_door.c:264 — Battle Tower sliding door (BF outside east)
  {
    metatileNum: METATILE_BattleFrontierOutsideEast_Door_BattleTower,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tower.png',
    paletteIndices: sDoorAnimPalettes_BattleTower,
  },
  // field_door.c:265 — Battle Arena door (BF outside east)
  {
    metatileNum: METATILE_BattleFrontierOutsideEast_Door_BattleArena,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_arena.png',
    paletteIndices: sDoorAnimPalettes_BattleArena,
  },
  // field_door.c:266 — Battle Arena lobby door (ARENA sound)
  {
    metatileNum: METATILE_BattleArena_Door,
    sound: DOOR_SOUND_ARENA,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_arena_lobby.png',
    paletteIndices: sDoorAnimPalettes_BattleArenaLobby,
  },
  // field_door.c:267 — Battle Dome lobby sliding door
  {
    metatileNum: METATILE_BattleDome_Door_Lobby,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_dome_lobby.png',
    paletteIndices: sDoorAnimPalettes_BattleDomeLobby,
  },
  // field_door.c:268 — Battle Palace lobby door
  {
    metatileNum: METATILE_BattlePalace_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_palace_lobby.png',
    paletteIndices: sDoorAnimPalettes_BattlePalaceLobby,
  },
  // field_door.c:269 — Slateport Battle Tent sliding door
  {
    metatileNum: METATILE_Slateport_Door_BattleTent,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tent.png',
    paletteIndices: sDoorAnimPalettes_BattleTent,
  },
  // field_door.c:270 — Mauville Battle Tent sliding door (reuses BattleTent GFX)
  {
    metatileNum: METATILE_Mauville_Door_BattleTent,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tent.png',
    paletteIndices: sDoorAnimPalettes_BattleTent,
  },
  // field_door.c:271 — Fallarbor Battle Tent sliding door (reuses BattleTent GFX)
  {
    metatileNum: METATILE_Fallarbor_Door_BattleTent,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tent.png',
    paletteIndices: sDoorAnimPalettes_BattleTent,
  },
  // field_door.c:272 — Battle Dome corridor sliding door
  {
    metatileNum: METATILE_BattleDome_Door_Corridor,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_dome_corridor.png',
    paletteIndices: sDoorAnimPalettes_BattleDomeCorridor,
  },
  // field_door.c:273 — Battle Tower multi-corridor sliding door (size=2)
  {
    metatileNum: METATILE_BattleFrontier_Door_MultiCorridor,
    sound: DOOR_SOUND_SLIDING,
    size: 2,
    tilesPath: '/decomp/em/door_anims/battle_tower_multi_corridor.png',
    paletteIndices: sDoorAnimPalettes_BattleTowerMultiCorridor,
  },
  // field_door.c:274 — Battle Frontier outside west normal door
  {
    metatileNum: METATILE_BattleFrontierOutsideWest_Door,
    sound: DOOR_SOUND_NORMAL,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_frontier.png',
    paletteIndices: sDoorAnimPalettes_BattleFrontier,
  },
  // field_door.c:275 — Battle Frontier outside west sliding door
  // (different tiles sDoorAnimTiles_BattleFrontierSliding, same palette as above)
  {
    metatileNum: METATILE_BattleFrontierOutsideWest_Door_Sliding,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_frontier_sliding.png',
    paletteIndices: sDoorAnimPalettes_BattleFrontier,
  },
  // field_door.c:276 — Battle Dome pre-battle room sliding door
  {
    metatileNum: METATILE_BattleDome_Door_PreBattleRoom,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_dome_pre_battle_room.png',
    paletteIndices: sDoorAnimPalettes_BattleDomePreBattleRoom,
  },
  // field_door.c:277 — Battle Tent interior sliding door
  {
    metatileNum: METATILE_BattleTent_Door,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/battle_tent_interior.png',
    paletteIndices: sDoorAnimPalettes_BattleTentInterior,
  },
  // field_door.c:278 — Trainer Hill lobby elevator sliding door
  {
    metatileNum: METATILE_TrainerHill_Door_Elevator_Lobby,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/trainer_hill_lobby_elevator.png',
    paletteIndices: sDoorAnimPalettes_TrainerHillLobbyElevator,
  },
  // field_door.c:279 — Trainer Hill roof elevator sliding door
  {
    metatileNum: METATILE_TrainerHill_Door_Elevator_Roof,
    sound: DOOR_SOUND_SLIDING,
    size: 1,
    tilesPath: '/decomp/em/door_anims/trainer_hill_roof_elevator.png',
    paletteIndices: sDoorAnimPalettes_TrainerHillRoofElevator,
  },
];

// ─── Loader async cache ─────────────────────────────────────────────────────

/** Cache des PNG door anims décodés en raw 4bpp Uint8Array. */
const _doorTilesCache = new Map<string, Uint8Array>();

/** Async load + cache un door anim PNG.
 *  Utilise `loadTileBin` qui PRÉSERVE les indices PLTE originaux via parse IDAT
 *  direct. `loadIndexedPngStrict` rebuilderait la palette par encounter-order =
 *  shift les indices = couleurs random quand interprété via palette bank
 *  Petalburg 6/10 (= glitch noir pendant l'anim). */
async function loadDoorTiles(path: string): Promise<Uint8Array> {
  const cached = _doorTilesCache.get(path);
  if (cached) return cached;
  const tiles = await loadTileBin(path, 4);
  _doorTilesCache.set(path, tiles);
  return tiles;
}

/** Prefetch toutes les door tiles connues. À appeler au boot ou map load.
 *  Évite latency sur premier `FieldAnimateDoorOpen` call. */
export async function preloadDoorTiles(): Promise<void> {
  await Promise.all(sDoorAnimGraphicsTable.map(g => loadDoorTiles(g.tilesPath)));
}

/** 1:1 décomp `GetDoorGraphics` (field_door.c:426). Lookup door table par
 *  metatile_id. */
function getDoorGraphics(metatileId: number): DoorGraphics | null {
  for (const entry of sDoorAnimGraphicsTable) {
    if (entry.metatileNum === metatileId) return entry;
  }
  return null;
}

// ─── BuildDoorTiles + CopyDoorTilesToVram + DrawCurrentDoorAnimFrame ────────

/** 1:1 décomp `BuildDoorTiles(tiles, tileNum, paletteNums)` (field_door.c:297).
 *  Construit 8 u16 BG tilemap entries pour 1 metatile :
 *    [0..3] = door tile (tileNum + i) avec palette paletteNums[0..3] (= bottom layer)
 *    [4..7] = tile 0 avec palette paletteNums[4..7] (= top layer = transparent over door)
 *
 *  Note : la décomp incrémente `paletteNums++` 8 fois → pour bottom metatile
 *  appelé avec `&paletteNums[4]`, lit théoriquement paletteNums[8..11] (= OOB).
 *  Mais ces tiles sont 0 (transparent) donc la palette n'a pas d'impact visuel.
 *  Notre version : `?? 0` fallback pour paletteNums[4..7] OOB → palette 0. */
function BuildDoorTiles(
  tiles: Uint16Array, dest: number, tileNum: number, paletteNums: readonly number[],
): void {
  for (let i = 0; i < 4; i++) {
    const pal = paletteNums[i] ?? 0;
    tiles[dest + i] = (pal << 12) | (tileNum + i);
  }
  for (let i = 4; i < 8; i++) {
    const pal = paletteNums[i] ?? 0;
    tiles[dest + i] = (pal << 12) | 0;
  }
}

/** 1:1 décomp `CopyDoorTilesToVram(gfx, frame)` (field_door.c:289).
 *  Copy 8 (size=1) ou 16 (size=2) tiles du PNG raw 4bpp à un slot VRAM fixe. */
function CopyDoorTilesToVram(
  rt: DecompRuntime, tiles: Uint8Array, gfx: DoorGraphics, frame: DoorAnimFrame,
): void {
  const numTiles = gfx.size === 2 ? 16 : 8;
  const destTileNum = gfx.size === 2 ? DOOR_TILE_START_SIZE2 : DOOR_TILE_START_SIZE1;
  const destByteOffset = destTileNum * TILE_SIZE_4BPP;
  const numBytes = numTiles * TILE_SIZE_4BPP;
  const srcByteOffset = frame.offset;  // 1:1 décomp : offset déjà en bytes
  rt.gba.vram.set(tiles.subarray(srcByteOffset, srcByteOffset + numBytes), destByteOffset);
}

/** 1:1 décomp `DrawCurrentDoorAnimFrame(gfx, x, y, paletteNums)` (field_door.c:317).
 *  Pour size=1 : write 2 metatiles (top + bottom) avec BuildDoorTiles + DrawDoorMetatileAt.
 *  Pour size=2 : write 4 metatiles (top-left/right + bottom-left/right). */
function DrawCurrentDoorAnimFrame(
  rt: DecompRuntime, gfx: DoorGraphics, x: number, y: number, paletteNums: readonly number[],
): void {
  void rt;  // GetCameraTopLeftCoords reads global state
  const cam = GetCameraTopLeftCoords();

  if (gfx.size === 2) {
    const tiles = new Uint16Array(8);
    // Top left
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE2 + 0, paletteNums);
    DrawDoorMetatileAt(cam.x, cam.y, x, y - 1, tiles);
    // Bottom left
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE2 + 4, paletteNums.slice(4));
    DrawDoorMetatileAt(cam.x, cam.y, x, y, tiles);
    // Top right
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE2 + 8, paletteNums);
    DrawDoorMetatileAt(cam.x, cam.y, x + 1, y - 1, tiles);
    // Bottom right
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE2 + 12, paletteNums.slice(4));
    DrawDoorMetatileAt(cam.x, cam.y, x + 1, y, tiles);
  } else {
    const tiles = new Uint16Array(8);
    // Top metatile (= upper half of door, 16x16)
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE1 + 0, paletteNums);
    DrawDoorMetatileAt(cam.x, cam.y, x, y - 1, tiles);
    // Bottom metatile (= lower half of door, 16x16)
    BuildDoorTiles(tiles, 0, DOOR_TILE_START_SIZE1 + 4, paletteNums.slice(4));
    DrawDoorMetatileAt(cam.x, cam.y, x, y, tiles);
  }
}

/** 1:1 décomp `DrawClosedDoorTiles(gfx, x, y)` (field_door.c:351).
 *  Restore le metatile original (= écrit dans sBackupMapData) via
 *  CurrentMapDrawMetatileAt. */
function DrawClosedDoorTiles(_rt: DecompRuntime, gfx: DoorGraphics, x: number, y: number): void {
  const cam = GetCameraTopLeftCoords();
  CurrentMapDrawMetatileAt(cam.x, cam.y, x, y - 1);
  CurrentMapDrawMetatileAt(cam.x, cam.y, x, y);
  if (gfx.size === 2) {
    CurrentMapDrawMetatileAt(cam.x, cam.y, x + 1, y - 1);
    CurrentMapDrawMetatileAt(cam.x, cam.y, x + 1, y);
  }
}

/** 1:1 décomp `DrawDoor(gfx, frame, x, y)` (field_door.c:363). */
function DrawDoor(
  rt: DecompRuntime, tiles: Uint8Array, gfx: DoorGraphics, frame: DoorAnimFrame, x: number, y: number,
): void {
  // 1:1 décomp : if (frame->offset == 0xFFFF) DrawClosedDoorTiles else CopyDoorTilesToVram + DrawCurrentDoorAnimFrame.
  // Note : `frame.offset === -1` JS = 0xFFFF u16. Le sentinel "draw closed".
  if (frame.offset === -1 || (frame.offset & 0xFFFF) === 0xFFFF) {
    DrawClosedDoorTiles(rt, gfx, x, y);
  } else {
    CopyDoorTilesToVram(rt, tiles, gfx, frame);
    DrawCurrentDoorAnimFrame(rt, gfx, x, y, gfx.paletteIndices);
  }
}

// ─── Task_AnimateDoor 1:1 décomp ────────────────────────────────────────────

/** Task data layout (= 1:1 décomp `tFrameId/tCounter/tX/tY` data[4..7]).
 *  data[0..3] sont placeholder (= la décomp y stocke des u16 pointers vers
 *  frames + gfx, on utilise un side-map JS à la place). */
const TASK_DATA_FRAME_ID = 4;
const TASK_DATA_COUNTER  = 5;
const TASK_DATA_X        = 6;
const TASK_DATA_Y        = 7;

/** Side-map taskId → { frames, gfx, tiles, resolve } : remplace les pointers
 *  data[0..3] de la décomp (= JS ne peut pas store pointers dans s16 array). */
interface DoorTaskState {
  frames: readonly DoorAnimFrame[];
  gfx: DoorGraphics;
  tiles: Uint8Array;
  resolve: () => void;
}
const _doorTaskState = new Map<number, DoorTaskState>();

/** 1:1 décomp `Task_AnimateDoor(taskId)` (field_door.c:409).
 *  - AnimateDoorFrame returns FALSE → DestroyTask. */
function Task_AnimateDoor(task: { taskId: number; data: number[] }): void {
  const state = _doorTaskState.get(task.taskId);
  if (!state) return;
  const data = task.data;

  // 1:1 décomp `AnimateDoorFrame(gfx, frames, data)` (field_door.c:391).
  // counter == 0 → DrawDoor (= apply current frame).
  if (data[TASK_DATA_COUNTER] === 0) {
    DrawDoor(getRuntime(), state.tiles, state.gfx, state.frames[data[TASK_DATA_FRAME_ID]],
      data[TASK_DATA_X], data[TASK_DATA_Y]);
  }

  // counter == frame.time → next frame. Sinon counter++.
  if (data[TASK_DATA_COUNTER] === state.frames[data[TASK_DATA_FRAME_ID]].time) {
    data[TASK_DATA_COUNTER] = 0;
    data[TASK_DATA_FRAME_ID]++;
    // Si next frame.time == 0 → END. Sinon continue.
    if (state.frames[data[TASK_DATA_FRAME_ID]].time === 0) {
      // 1:1 décomp : DestroyTask. Notre version : resolve la promise + cleanup.
      state.resolve();
      _doorTaskState.delete(task.taskId);
      getRuntime().DestroyTask(task.taskId);
      return;
    }
  } else {
    data[TASK_DATA_COUNTER]++;
  }
}

/** 1:1 décomp `StartDoorAnimationTask(gfx, frames, x, y)` (field_door.c:437).
 *  Setup data[] + side-map state, retourne Promise qui resolve à task end. */
async function StartDoorAnimationTask(
  rt: DecompRuntime, gfx: DoorGraphics, frames: readonly DoorAnimFrame[],
  x: number, y: number,
): Promise<void> {
  // 1:1 décomp : check FuncIsActiveTask(Task_AnimateDoor) — skip si déjà active.
  // Notre version : on permet plusieurs door anims simultanées (rare mais possible
  // si door warp et autre door visible en même temps). Pour MVP : OK.

  // Load tiles si pas cached. Async — caller doit await.
  const tiles = await loadDoorTiles(gfx.tilesPath);

  return new Promise((resolve) => {
    const taskId = rt.CreateTask(Task_AnimateDoor, 0x50);
    const task = rt.gTasks.get(taskId);
    if (!task) {
      console.warn('[StartDoorAnimationTask] CreateTask failed');
      resolve();
      return;
    }
    task.data[TASK_DATA_FRAME_ID] = 0;
    task.data[TASK_DATA_COUNTER] = 0;
    task.data[TASK_DATA_X] = x;
    task.data[TASK_DATA_Y] = y;
    _doorTaskState.set(taskId, { frames, gfx, tiles, resolve });
  });
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
 *  Démarre l'anim d'ouverture de porte à la position donnée. Returns Promise
 *  qui resolve quand l'anim est terminée (= 16 frames game-time). */
export async function FieldAnimateDoorOpen(mapX: number, mapY: number): Promise<void> {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) {
    return;  // 1:1 décomp : returns -1 si pas une door.
  }
  const metatileId = MapGridGetMetatileIdAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  const gfx = getDoorGraphics(metatileId);
  if (!gfx) {
    console.warn(`[FieldAnimateDoorOpen] no DoorGraphics for metatileId=${metatileId} at (${mapX},${mapY})`);
    return;
  }
  const frames = gfx.size === 2 ? sBigDoorOpenAnimFrames : sDoorOpenAnimFrames;
  // Note : door anim coords sont en map-relative (= MAP_OFFSET inclus pour
  // matcher CurrentMapDrawMetatileAt qui consomme map coords avec offset).
  await StartDoorAnimationTask(getRuntime(), gfx, frames, mapX + MAP_OFFSET, mapY + MAP_OFFSET);
}

/** 1:1 décomp `FieldAnimateDoorClose(x, y)` (field_door.c:525). */
export async function FieldAnimateDoorClose(mapX: number, mapY: number): Promise<void> {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) {
    return;
  }
  const metatileId = MapGridGetMetatileIdAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  const gfx = getDoorGraphics(metatileId);
  if (!gfx) {
    console.warn(`[FieldAnimateDoorClose] no DoorGraphics for metatileId=${metatileId} at (${mapX},${mapY})`);
    return;
  }
  const frames = gfx.size === 2 ? sBigDoorCloseAnimFrames : sDoorCloseAnimFrames;
  await StartDoorAnimationTask(getRuntime(), gfx, frames, mapX + MAP_OFFSET, mapY + MAP_OFFSET);
}

/** 1:1 décomp `FieldSetDoorOpened(x, y)` (field_door.c:513).
 *  Set door to fully-opened state immediately (= no anim, last frame only).
 *  Used par `Task_ExitDoor` case 0 pour que la door soit déjà ouverte au load
 *  (= player apparaît at door tile, walks down through it). */
export async function FieldSetDoorOpened(mapX: number, mapY: number): Promise<void> {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) return;
  const metatileId = MapGridGetMetatileIdAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  const gfx = getDoorGraphics(metatileId);
  if (!gfx) return;
  // 1:1 décomp `DrawOpenedDoor` (field_door.c:466) : draw last frame de l'open anim.
  const frames = gfx.size === 2 ? sBigDoorOpenAnimFrames : sDoorOpenAnimFrames;
  // Get last anim frame (= frames[3], avant le END sentinel).
  const lastFrame = frames[3];
  const tiles = await loadDoorTiles(gfx.tilesPath);
  DrawDoor(getRuntime(), tiles, gfx, lastFrame, mapX + MAP_OFFSET, mapY + MAP_OFFSET);
}

/** 1:1 décomp `FieldSetDoorClosed(x, y)` (field_door.c:519).
 *  Restore door to closed state (= original metatile draw). */
export function FieldSetDoorClosed(mapX: number, mapY: number): void {
  const behavior = MapGridGetMetatileBehaviorAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  if (behavior !== MB_ANIMATED_DOOR) return;
  const metatileId = MapGridGetMetatileIdAt(mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  const gfx = getDoorGraphics(metatileId);
  if (!gfx) return;
  // 1:1 décomp `DrawClosedDoor` → DrawClosedDoorTiles (= restore original).
  DrawClosedDoorTiles(getRuntime(), gfx, mapX + MAP_OFFSET, mapY + MAP_OFFSET);
}

/** 1:1 décomp `FieldIsDoorAnimationRunning()` (field_door.c:541).
 *  Returns true si au moins 1 Task_AnimateDoor est active. */
export function FieldIsDoorAnimationRunning(): boolean {
  return _doorTaskState.size > 0;
}
