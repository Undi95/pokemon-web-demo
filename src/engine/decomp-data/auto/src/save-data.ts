// AUTO-GENERATED from src/save.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/save.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tInBattleTower_EXPR = "data[2]";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u16", name: 'gLastWrittenSector', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gLastSaveCounter', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gLastKnownGoodSector', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gDamagedSaveSectors', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gSaveCounter', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gIncrementalSectorId', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gSaveUnusedVar', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gSaveFileStatus', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "MainCallback", name: 'gGameContinueCallback', isArray: false, init: "NULL" },
  { segment: 'COMMON_DATA', type: "struct SaveSectorLocation", name: 'gRamSaveSectorLocations', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gSaveUnusedVar2', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gSaveAttemptStatus', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct SaveSector", name: 'gSaveDataBuffer', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnusedVar', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CalculateChecksum', ret: "u16", arity: 2, params: "void *, u16" },
  { name: 'ReadFlashSector', ret: "bool8", arity: 2, params: "u8, struct SaveSector *" },
  { name: 'GetSaveValidStatus', ret: "u8", arity: 1, params: "const struct SaveSectorLocation *" },
  { name: 'CopySaveSlotData', ret: "u8", arity: 2, params: "u16, struct SaveSectorLocation *" },
  { name: 'TryWriteSector', ret: "u8", arity: 2, params: "u8, u8 *" },
  { name: 'HandleWriteSector', ret: "u8", arity: 2, params: "u16, const struct SaveSectorLocation *" },
  { name: 'HandleReplaceSector', ret: "u8", arity: 2, params: "u16, const struct SaveSectorLocation *" },
  { name: 'ClearSaveData', ret: "void", arity: 0, params: "void" },
  { name: 'Save_ResetSaveCounters', ret: "void", arity: 0, params: "void" },
  { name: 'SetDamagedSectorBits', ret: "bool32", arity: 2, params: "u8 op, u8 sectorId" },
  { name: 'WriteSaveSectorOrSlot', ret: "u8", arity: 2, params: "u16 sectorId, const struct SaveSectorLocation *locations" },
  { name: 'HandleWriteSectorNBytes', ret: "u8", arity: 3, params: "u8 sectorId, u8 *data, u16 size" },
  { name: 'RestoreSaveBackupVarsAndIncrement', ret: "u32", arity: 1, params: "const struct SaveSectorLocation *locations" },
  { name: 'RestoreSaveBackupVars', ret: "u32", arity: 1, params: "const struct SaveSectorLocation *locations" },
  { name: 'HandleWriteIncrementalSector', ret: "u8", arity: 2, params: "u16 numSectors, const struct SaveSectorLocation *locations" },
  { name: 'HandleReplaceSectorAndVerify', ret: "u8", arity: 2, params: "u16 sectorId, const struct SaveSectorLocation *locations" },
  { name: 'WriteSectorSignatureByte_NoOffset', ret: "u8", arity: 2, params: "u16 sectorId, const struct SaveSectorLocation *locations" },
  { name: 'CopySectorSignatureByte', ret: "u8", arity: 2, params: "u16 sectorId, const struct SaveSectorLocation *locations" },
  { name: 'WriteSectorSignatureByte', ret: "u8", arity: 2, params: "u16 sectorId, const struct SaveSectorLocation *locations" },
  { name: 'TryLoadSaveSlot', ret: "u8", arity: 2, params: "u16 sectorId, struct SaveSectorLocation *locations" },
  { name: 'TryLoadSaveSector', ret: "u8", arity: 3, params: "u8 sectorId, u8 *data, u16 size" },
  { name: 'UpdateSaveAddresses', ret: "void", arity: 0, params: "void" },
  { name: 'HandleSavingData', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'TrySavingData', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'LinkFullSave_Init', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_WriteSector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_ReplaceLastSector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_SetLastSectorSignature', ret: "bool8", arity: 0, params: "void" },
  { name: 'WriteSaveBlock2', ret: "bool8", arity: 0, params: "void" },
  { name: 'WriteSaveBlock1Sector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadGameSave', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'GetSaveBlocksPointersBaseOffset', ret: "u16", arity: 0, params: "void" },
  { name: 'TryReadSpecialSaveSector', ret: "u32", arity: 2, params: "u8 sector, u8 *dst" },
  { name: 'TryWriteSpecialSaveSector', ret: "u32", arity: 2, params: "u8 sector, u8 *src" },
  { name: 'Task_LinkFullSave', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_LinkFullSave',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'agb_flash.h',
  'gba/flash_internal.h',
  'fieldmap.h',
  'save.h',
  'task.h',
  'decompress.h',
  'load_save.h',
  'overworld.h',
  'pokemon_storage_system.h',
  'trainer_hill.h',
  'link.h',
  'constants/game_stat.h',
] as const;
