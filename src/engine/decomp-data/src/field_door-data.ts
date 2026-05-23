// AUTO-GENERATED from src/field_door.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_door.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const DOOR_SOUND_NORMAL = 0;
export const DOOR_SOUND_SLIDING = 1;
export const DOOR_SOUND_ARENA = 2;
/** Raw expr: `(NUM_TILES_TOTAL - 8)` */
export const DOOR_TILE_START_SIZE1_EXPR = "(NUM_TILES_TOTAL - 8)";
/** Raw expr: `(NUM_TILES_TOTAL - 16)` */
export const DOOR_TILE_START_SIZE2_EXPR = "(NUM_TILES_TOTAL - 16)";
/** Raw expr: `data[0]` */
export const tFramesHi_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tFramesLo_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tGfxHi_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tGfxLo_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFrameId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tCounter_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tX_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tY_EXPR = "data[7]";

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sDoorAnimTiles_Littleroot': { path: 'graphics/door_anims/littleroot.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BirchsLab': { path: 'graphics/door_anims/birchs_lab.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_FallarborLightRoof': { path: 'graphics/door_anims/fallarbor_light_roof.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Lilycove': { path: 'graphics/door_anims/lilycove.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_LilycoveWooden': { path: 'graphics/door_anims/lilycove_wooden.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_General': { path: 'graphics/door_anims/general.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_PokeCenter': { path: 'graphics/door_anims/poke_center.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Gym': { path: 'graphics/door_anims/gym.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_PokeMart': { path: 'graphics/door_anims/poke_mart.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_RustboroTan': { path: 'graphics/door_anims/rustboro_tan.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_RustboroGray': { path: 'graphics/door_anims/rustboro_gray.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Oldale': { path: 'graphics/door_anims/oldale.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_UnusedTops': { path: 'graphics/door_anims/unused_top.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_UnusedBottoms': { path: 'graphics/door_anims/unused_bottom.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Mauville': { path: 'graphics/door_anims/mauville.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Verdanturf': { path: 'graphics/door_anims/verdanturf.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Slateport': { path: 'graphics/door_anims/slateport.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Dewford': { path: 'graphics/door_anims/dewford.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Contest': { path: 'graphics/door_anims/contest.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Mossdeep': { path: 'graphics/door_anims/mossdeep.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_SootopolisPeakedRoof': { path: 'graphics/door_anims/sootopolis_peaked_roof.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Sootopolis': { path: 'graphics/door_anims/sootopolis.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_PokemonLeague': { path: 'graphics/door_anims/pokemon_league.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_Pacifidlog': { path: 'graphics/door_anims/pacifidlog.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_PetalburgGym': { path: 'graphics/door_anims/petalburg_gym.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_CyclingRoad': { path: 'graphics/door_anims/cycling_road.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_LilycoveDeptStore': { path: 'graphics/door_anims/lilycove_dept_store.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_SafariZone': { path: 'graphics/door_anims/safari_zone.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_MossdeepSpaceCenter': { path: 'graphics/door_anims/mossdeep_space_center.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_CableClub': { path: 'graphics/door_anims/cable_club.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_AbandonedShip': { path: 'graphics/door_anims/abandoned_ship.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_FallarborDarkRoof': { path: 'graphics/door_anims/fallarbor_dark_roof.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_AbandonedShipRoom': { path: 'graphics/door_anims/abandoned_ship_room.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_LilycoveDeptStoreElevator': { path: 'graphics/door_anims/lilycove_dept_store_elevator.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleTowerOld': { path: 'graphics/door_anims/battle_tower_old.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleTowerElevator': { path: 'graphics/door_anims/battle_tower_elevator.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_UnusedBattleFrontier': { path: 'graphics/door_anims/unused_battle_frontier.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleDome': { path: 'graphics/door_anims/battle_dome.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleFactory': { path: 'graphics/door_anims/battle_factory.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleTower': { path: 'graphics/door_anims/battle_tower.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleArena': { path: 'graphics/door_anims/battle_arena.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleArenaLobby': { path: 'graphics/door_anims/battle_arena_lobby.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleDomeLobby': { path: 'graphics/door_anims/battle_dome_lobby.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattlePalaceLobby': { path: 'graphics/door_anims/battle_palace_lobby.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleTent': { path: 'graphics/door_anims/battle_tent.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleDomeCorridor': { path: 'graphics/door_anims/battle_dome_corridor.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleFrontier': { path: 'graphics/door_anims/battle_frontier.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleFrontierSliding': { path: 'graphics/door_anims/battle_frontier_sliding.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleDomePreBattleRoom': { path: 'graphics/door_anims/battle_dome_pre_battle_room.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_BattleTentInterior': { path: 'graphics/door_anims/battle_tent_interior.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_TrainerHillLobbyElevator': { path: 'graphics/door_anims/trainer_hill_lobby_elevator.png', ext: '.4bpp', type: 'u8' },
  'sDoorAnimTiles_TrainerHillRoofElevator': { path: 'graphics/door_anims/trainer_hill_roof_elevator.png', ext: '.4bpp', type: 'u8' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sDoorAnimPalettes_General: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_PokeCenter: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_Gym: readonly number[] = [5,5,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_PokeMart: readonly number[] = [0,0,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_Littleroot: readonly number[] = [10,10,6,6,6,6,6,6] as const;
export const sDoorAnimPalettes_BirchsLab: readonly number[] = [8,8,8,8,8,8,8,8] as const;
export const sDoorAnimPalettes_RustboroTan: readonly number[] = [11,11,11,11,11,11,11,11] as const;
export const sDoorAnimPalettes_RustboroGray: readonly number[] = [10,10,10,10,10,10,10,10] as const;
export const sDoorAnimPalettes_FallarborLightRoof: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_Lilycove: readonly number[] = [8,8,8,8,8,8,8,8] as const;
export const sDoorAnimPalettes_Oldale: readonly number[] = [10,10,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_Mossdeep: readonly number[] = [9,9,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_PokemonLeague: readonly number[] = [8,8,8,8,8,8,8,8] as const;
export const sDoorAnimPalettes_Pacifidlog: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_SootopolisPeakedRoof: readonly number[] = [6,6,6,6,6,6,6,6] as const;
export const sDoorAnimPalettes_Sootopolis: readonly number[] = [6,6,6,6,6,6,6,6] as const;
export const sDoorAnimPalettes_Dewford: readonly number[] = [0,0,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_Slateport: readonly number[] = [6,6,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_Mauville: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_Verdanturf: readonly number[] = [6,6,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_LilycoveWooden: readonly number[] = [5,5,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_Contest: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_PetalburgGym: readonly number[] = [6,6,6,6,6,6,6,6] as const;
export const sDoorAnimPalettes_CyclingRoad: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_LilycoveDeptStore: readonly number[] = [5,5,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_SafariZone: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_MossdeepSpaceCenter: readonly number[] = [8,8,8,8,8,8,8,8] as const;
export const sDoorAnimPalettes_CableClub: readonly number[] = [6,6,6,6,6,6,6,6] as const;
export const sDoorAnimPalettes_AbandonedShip: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_FallarborDarkRoof: readonly number[] = [11,11,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_AbandonedShipRoom: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_LilycoveDeptStoreElevator: readonly number[] = [6,6,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattleTowerOld: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_BattleTowerElevator: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_UnusedBattleFrontier: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_BattleDome: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_BattleFactory: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_BattleTower: readonly number[] = [0,0,0,0,0,0,0,0] as const;
export const sDoorAnimPalettes_BattleArena: readonly number[] = [5,5,5,5,5,5,5,5] as const;
export const sDoorAnimPalettes_BattleArenaLobby: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattleDomeLobby: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattlePalaceLobby: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattleTent: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_BattleDomeCorridor: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattleTowerMultiCorridor: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_Unused: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_BattleFrontier: readonly number[] = [1,1,1,1,1,1,1,1] as const;
export const sDoorAnimPalettes_BattleDomePreBattleRoom: readonly number[] = [9,9,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_BattleTentInterior: readonly number[] = [9,9,9,9,9,9,9,9] as const;
export const sDoorAnimPalettes_TrainerHillLobbyElevator: readonly number[] = [7,7,7,7,7,7,7,7] as const;
export const sDoorAnimPalettes_TrainerHillRoofElevator: readonly number[] = [9,9,7,7,7,7,7,7] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ShouldUseMultiCorridorDoor', ret: "bool8", arity: 0, params: "void" },
  { name: 'CopyDoorTilesToVram', ret: "void", arity: 2, params: "const struct DoorGraphics *gfx, const struct DoorAnimFrame *frame" },
  { name: 'BuildDoorTiles', ret: "void", arity: 3, params: "u16 *tiles, u16 tileNum, const u8 *paletteNums" },
  { name: 'DrawCurrentDoorAnimFrame', ret: "void", arity: 4, params: "const struct DoorGraphics *gfx, u32 x, u32 y, const u8 *paletteNums" },
  { name: 'DrawClosedDoorTiles', ret: "void", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'DrawDoor', ret: "void", arity: 4, params: "const struct DoorGraphics *gfx, const struct DoorAnimFrame *frame, u32 x, u32 y" },
  { name: 'AnimateDoorFrame', ret: "bool32", arity: 3, params: "struct DoorGraphics *gfx, struct DoorAnimFrame *frames, s16 *data" },
  { name: 'Task_AnimateDoor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartDoorAnimationTask', ret: "s8", arity: 4, params: "const struct DoorGraphics *gfx, const struct DoorAnimFrame *frames, u32 x, u32 y" },
  { name: 'DrawClosedDoor', ret: "void", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'DrawOpenedDoor', ret: "void", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'StartDoorOpenAnimation', ret: "s8", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'StartDoorCloseAnimation', ret: "s8", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'GetDoorSoundType', ret: "s8", arity: 3, params: "const struct DoorGraphics *gfx, u32 x, u32 y" },
  { name: 'Debug_FieldAnimateDoorOpen', ret: "UNUSED", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldSetDoorOpened', ret: "void", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldSetDoorClosed', ret: "void", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldAnimateDoorClose', ret: "s8", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldAnimateDoorOpen', ret: "s8", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldIsDoorAnimationRunning', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetDoorSoundEffect', ret: "u32", arity: 2, params: "u32 x, u32 y" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnimateDoor',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'field_door.h',
  'field_camera.h',
  'fieldmap.h',
  'metatile_behavior.h',
  'task.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
] as const;
